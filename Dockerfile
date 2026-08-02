# ============================================================
# Tray'd - Dockerfile
# @description Multi-stage build for production deployment
#              Compatible with Netlify, Render, and Docker
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

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Skip static generation for error pages during build
ENV NEXT_PRIVATE_STANDALONE_MODE=true

# Build the application with error handling
RUN npm run build || { echo "Build failed, attempting recovery..."; exit 1; }

# ----------------------------------------------------------
# Stage 3: Production
# ----------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output from build stage
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
