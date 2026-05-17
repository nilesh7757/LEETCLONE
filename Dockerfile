# Use Node.js 20-alpine for a small, secure base image
FROM node:20-alpine AS base
WORKDIR /app
# Added python3 and sqlite for native execution
RUN apk add --no-cache libc6-compat openssl g++ build-base python3 sqlite

# Stage 1: Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Stage 2: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# Remove dev dependencies to save space in the final image
RUN npm prune --omit=dev

# Stage 3: Production environment
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.js ./server.js

# Use non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
