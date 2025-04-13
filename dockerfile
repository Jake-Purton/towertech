# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm@latest-10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the app
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "start"]
