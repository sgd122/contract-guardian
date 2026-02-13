# ============================================
# Contract Guardian - Multi-stage Dockerfile
# ============================================

# ========================
# Stage 1: Base
# ========================
FROM node:22-slim AS base

# System dependencies for PDF processing and canvas native module
RUN apt-get update && apt-get install -y --no-install-recommends \
  poppler-utils \
  graphicsmagick \
  build-essential \
  python3 \
  pkg-config \
  libpixman-1-dev \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# ========================
# Stage 2: Dependencies
# ========================
FROM base AS deps

# Copy workspace config for dependency resolution
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Only install dependencies for web and its workspace deps (skip mobile/expo)
RUN pnpm install --frozen-lockfile --filter=@cg/web...

# ========================
# Stage 3: Development
# ========================
FROM base AS dev

WORKDIR /app
COPY --from=deps /app/ ./
COPY . .

EXPOSE 3000

CMD ["pnpm", "dev:web"]

# ========================
# Stage 4: Builder
# ========================
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/ ./
COPY . .

# Build args for NEXT_PUBLIC_* variables (required at build time)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_TOSS_CLIENT_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_TOSS_CLIENT_KEY=$NEXT_PUBLIC_TOSS_CLIENT_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

RUN pnpm build --filter=@cg/web...

# ========================
# Stage 5: Runner (Production)
# ========================
FROM node:22-slim AS runner

# Runtime-only system dependencies for PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
  poppler-utils \
  graphicsmagick \
  libcairo2 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libjpeg62-turbo \
  libgif7 \
  librsvg2-2 \
  libpixman-1-0 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy public assets if they exist
COPY --from=builder /app/apps/web/public ./apps/web/public

RUN chown -R nextjs:nodejs ./apps/web/.next

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
