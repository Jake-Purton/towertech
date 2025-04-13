# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest-10

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm again here (needed for the build step)
RUN npm install -g pnpm@latest-10

# Copy installed deps from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source
COPY . .

# dummy env
ARG NEXT_PRIVATE_JWT_SECRET="dummy_secret"
ENV NEXT_PRIVATE_JWT_SECRET=$NEXT_PRIVATE_JWT_SECRET

# Run the Next.js build
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@latest-10

ENV NODE_ENV=production

# Copy built assets and production dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["pnpm", "start"]