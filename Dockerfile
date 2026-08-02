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
RUN npx next build --webpack

# Verify standalone output was created
RUN if [ ! -f /app/.next/standalone/server.js ]; then \
      echo "ERROR: Standalone server.js was not generated!"; \
      ls -la /app/.next/ || true; \
      exit 1; \
    fi

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

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
