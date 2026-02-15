# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Contract Guardian (계약서 지킴이) — AI-powered contract analysis platform for freelancers and small businesses in Korea. Analyzes contracts via Claude API, scores risk across 8 clause categories, and generates PDF reports. Web app is production-ready; mobile app (Expo) is Phase 2.

## Commands

```bash
# Install & Dev
pnpm install                  # Install all workspace dependencies
pnpm dev                      # Start all dev servers via Turbo
pnpm dev:web                  # Next.js dev server (localhost:3000)
pnpm dev:mobile               # Expo dev server

# Build & Check
pnpm build                    # Build all packages & apps (Turbo)
pnpm typecheck                # Type check entire workspace
pnpm lint                     # ESLint across all packages

# Database (requires Supabase CLI running locally)
pnpm db:generate              # supabase gen types typescript --local
pnpm db:migrate               # supabase db push

# Cleanup
pnpm clean                    # Remove .next, dist, .turbo

# Docker (Development - Supabase 포함 전체 스택)
pnpm docker:dev               # docker compose up -d
pnpm docker:dev:build          # Build & start all containers
pnpm docker:dev:down           # Stop all containers
pnpm docker:dev:logs           # Follow web container logs

# Docker (Production - Web only, standalone)
pnpm docker:prod:build         # Build optimized production image
pnpm docker:prod:up            # Start production container
pnpm docker:prod:down          # Stop production container
pnpm docker:clean              # Remove all containers + volumes
```

## Architecture

### Monorepo Layout (pnpm workspaces + Turbo)

- **apps/web** — Next.js 16 (React 19), App Router, Tailwind CSS 3.4, Radix UI
- **apps/mobile** — Expo 52 + React Native (Phase 2, scaffolded but not built)
- **packages/shared** (`@cg/shared`) — Types, constants, Zod validation schemas, utilities
- **packages/api** (`@cg/api`) — API client factory, Supabase auth/storage services, React hooks
- **packages/ui** (`@cg/ui`) — Radix-based components + animated components (Motion library)
- **packages/config** (`@cg/config`) — Shared tsconfig, ESLint, Tailwind configs

### Data Flow

```
Upload (PDF/image) → Text extraction → Supabase Storage + DB record
  → Toss Payment → Claude API analysis (8 categories, risk 0-100)
  → Parse JSON response → DB update → PDF report generation
```

### Analysis Status Lifecycle

`pending_payment` → `paid` → `processing` → `completed` | `failed`

### Web App FSD Architecture (apps/web/src/)

Feature-Sliced Design layers (import rule: layer N can only import from layers below):

| Layer | Directory | Purpose |
|-------|-----------|---------|
| app | `app/` | Next.js App Router pages (thin wrappers, ~5-15 lines each) |
| pages | `_pages/` | Page compositions combining widgets & features (prefixed `_` to avoid Next.js Pages Router conflict) |
| widgets | `widgets/` | Composite UI blocks (header, footer, landing sections, layouts) |
| features | `features/` | Business logic slices (upload, analysis, payment, auth, report, consent) |
| entities | `entities/` | Domain models & CRUD (analysis, payment) |
| shared | `shared/` | Shared utilities (supabase clients, env validation, rate-limit, types) |

Each slice follows: `api/` (server logic), `ui/` (components), `hooks/` (React hooks), `lib/` (utilities), `model/` (types/config), `index.ts` (barrel export).

### API Routes (apps/web/src/app/api/)

Thin handlers delegating to `features/*/api/` or `entities/*/api/`:

| Route | Purpose | Delegates to |
|-------|---------|-------------|
| `/api/upload` | File upload with PDF text extraction | `features/upload/api` |
| `/api/analyze/[id]` | Trigger Claude contract analysis | `features/analysis/api` |
| `/api/analyses/[id]` | Get/list/delete user analyses | `entities/analysis/api` |
| `/api/payment/{confirm,webhook}` | Toss Payments flow | `features/payment/api` |
| `/api/payment/{success,fail}` | Payment redirects (public) | inline |
| `/api/report/[id]` | Generate & download PDF report | `features/report/api` |
| `/api/auth/callback` | OAuth callback | inline |
| `/api/consent` | User consent tracking | `entities/consent/api` |

### Key Libraries (apps/web)

| Library | Purpose |
|---------|---------|
| `@anthropic-ai/sdk` | Claude API (model: `claude-sonnet-4-20250514`) |
| `pdf-parse` + `pdf-to-img` | PDF text/image extraction |
| `@react-pdf/renderer` | PDF report generation |
| `@supabase/ssr` + `@supabase/supabase-js` | DB, auth, storage |
| `motion` | Animations (Framer Motion alternative) |
| `sonner` | Toast notifications |

### Claude AI Integration (apps/web/src/features/analysis/lib/claude/)

- `client.ts` — Anthropic client singleton
- `prompts.ts` — System prompt defining 8 analysis criteria (payment, scope, IP, termination, warranty, confidentiality, liability, dispute resolution)
- `analyze-contract.ts` — Main analysis function (text mode & image mode for scanned documents)
- `parse-response.ts` — JSON response parsing into `AnalysisResult`

### Supabase Clients (apps/web/src/shared/api/supabase/)

- `client.ts` — Browser-side (respects RLS)
- `server.ts` — Server-side with cookie-based auth (respects RLS)
- `admin.ts` — Service role client (bypasses RLS, use only in API routes/features/entities api layers)

### Service Layer Pattern (packages/api/src/services/)

Services use a factory pattern: `createAnalysisService(client)`, `createPaymentService(client)`, etc. Each returns an object with methods bound to the provided Supabase client.

Hooks (`useAuth`, `useAnalyses`, `usePayment`) wrap these services for React state management.

## Conventions

- **Package imports:** Use `@cg/shared`, `@cg/api`, `@cg/ui` workspace aliases
- **TypeScript:** Strict mode, ES2022 target. Shared types in `packages/shared/src/types/`
- **Validation:** Zod schemas in `packages/shared/src/validation/`
- **Constants:** Centralized in `packages/shared/src/constants/` (routes, risk levels, pricing, file limits)
- **FSD imports:** Use `@/shared/*`, `@/entities/*`, `@/features/*`, `@/widgets/*`, `@/_pages/*` within apps/web
- **Components:** Base UI in `packages/ui/src/components/ui/`, animated variants in `packages/ui/src/components/animated/`. App-level components in respective FSD slice `ui/` directories
- **className merging:** Use `cn()` from `@cg/ui` (clsx + tailwind-merge)
- **Environment variables:** Defined in root `.env`, loaded via `dotenv` in `next.config.ts`. Client-side vars use `NEXT_PUBLIC_*` prefix, server-only vars have no prefix. See `.env.example`
- **Turbo env passthrough:** All env vars are declared in `turbo.json` `globalEnv`
- **File limits:** MAX_FILE_SIZE = 20MB, supported formats: PDF, JPEG, PNG
- **Next.js config:** Server actions body size limit is 25MB; transpiles `@cg/*` packages; `output: "standalone"` enabled for Docker production builds
- **Docker:** Multi-stage Dockerfile (dev/builder/runner targets). `docker-compose.yml` = dev with full Supabase stack, `docker-compose.prod.yml` = production web only. Env template at `.env.docker`

## Skills

| Skill | Description |
|-------|-------------|
| `verify-api-security` | API 라우트 보안 패턴 검증 (인증, 웹훅 서명, 원자적 상태 가드, 에러 응답 형식) |
| `verify-supabase-clients` | Supabase 클라이언트 사용 규칙 검증 (client/server/admin 분리, RLS 적용) |
| `verify-shared-packages` | 워크스페이스 패키지 규칙 검증 (@cg/* 임포트, 타입-스키마 정합성, re-export) |
| `verify-env-vars` | 환경변수 규칙 검증 (NEXT_PUBLIC_* 접두사, turbo.json globalEnv, 런타임 검증) |
