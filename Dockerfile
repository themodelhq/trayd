# ============================================================
# Tray'd - Dockerfile
# @description Multi-stage build for production deployment
#              Compatible with Netlify, Render, and Docker
#              Optimized Next.js 16 with proper standalone output
# ============================================================

# ----------------------------------------------------------
# Stage 1: Dependencies
# ----------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Copy Prisma schema BEFORE npm install (needed for postinstall)
COPY prisma ./prisma/

# Install dependencies (postinstall will run prisma generate automatically)
RUN npm install --legacy-peer-deps

# Explicitly ensure Prisma client is generated
RUN npx prisma generate

# ----------------------------------------------------------
# Stage 2: Build
# ----------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Increase Node.js memory limit for builds (prevents "call retries exceeded")
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Build the application with webpack for reliable standalone output
# Using webpack flag ensures consistent standalone server generation
# (Turbopack has a known regression in 16.1.x that omits/skips parts of
# the standalone output - see https://github.com/vercel/next.js/issues/88844)
#
# Next.js also has a known intermittent issue where .next/standalone/server.js
# can fail to be written even though the build itself reports success - this
# appears to be a race condition in the output-file-tracing step under CI/Docker
# (see https://github.com/oven-sh/bun/issues/25656 for the same symptom).
# To guard against that transient failure, retry the build once before
# treating it as a real error.
RUN set -e; \
    attempt=1; \
    max_attempts=2; \
    until [ -f /app/.next/standalone/server.js ]; do \
      if [ "$attempt" -gt "$max_attempts" ]; then \
        echo "ERROR: Standalone server.js was not generated after $max_attempts attempts!"; \
        ls -la /app/.next/ || true; \
        exit 1; \
      fi; \
      echo "Build attempt $attempt/$max_attempts..."; \
      rm -rf /app/.next; \
      npx next build --webpack; \
      sync; \
      attempt=$((attempt + 1)); \
    done; \
    echo "Standalone server.js confirmed present."

# ----------------------------------------------------------
# Stage 3: Production Runner
# ----------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Increase memory limit for production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from build stage (includes server.js)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files for database operations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Entrypoint generates the .z-ai-config file (from ZAI_SDK_API_KEY /
# ZAI_SDK_BASE_URL env vars) that the z-ai-web-dev-sdk package requires,
# since that package only reads config from a file, not env vars directly.
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
