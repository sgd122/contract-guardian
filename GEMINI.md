# Contract Guardian (계약서 지킴이) - Project Context

## Project Overview
**Contract Guardian**은 프리랜서와 소규모 사업자를 위한 AI 기반 계약서 분석 플랫폼입니다. 사용자가 계약서를 업로드하면 Claude AI가 8개 핵심 항목을 분석하고, 위험도를 점수화하며, 상세 PDF 리포트를 제공합니다.

- **Main Goal:** 계약서 독소 조항 방지 및 법적 리스크 완화.
- **Key Features:** 계약서 업로드, 텍스트 추출(PDF/OCR), 결제 연동(Toss Payments), AI 분석(Claude Sonnet), 분석 결과 시각화, PDF 리포트 다운로드.

## Tech Stack
- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend (Web):** Next.js 16 (App Router), React 19, Tailwind CSS, Radix UI (shadcn/ui), Framer Motion
- **Mobile:** Expo 52 (React Native), NativeWind (Phase 2)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **AI:** Anthropic Claude 3.5 Sonnet
- **Payments:** Toss Payments
- **Languages:** TypeScript (Strict mode)

## Architecture & Monorepo Structure
- `apps/web`: Next.js 웹 애플리케이션 (@cg/web)
- `apps/mobile`: Expo 모바일 애플리케이션 (@cg/mobile)
- `packages/shared`: 공유 타입 정의, Zod 스키마, 공통 상수 (@cg/shared)
- `packages/api`: Supabase 클라이언트 서비스, React Hooks, 비즈니스 로직 (@cg/api)
- `packages/ui`: 공통 UI 컴포넌트 라이브러리 (React 전용) (@cg/ui)
- `packages/config`: 공통 설정 (Tailwind, ESLint, TypeScript) (@cg/config)

## Core Workflows
1. **Upload:** 사용자가 파일을 업로드하면 `apps/web/src/app/api/upload`에서 텍스트를 추출하고 Supabase Storage에 저장합니다.
2. **Payment:** 분석 실행 전 Toss Payments를 통해 결제를 진행합니다 (`/api/payment`).
3. **Analysis:** 결제 완료 후 Claude API를 호출하여 계약서를 8개 카테고리별로 분석합니다 (`/api/analyze`).
4. **Report:** 분석 완료 시 PDF 라이브러리(`react-pdf`)를 사용하여 리포트를 생성하고 다운로드할 수 있게 합니다 (`/api/report`).

## Development Guide

### Prerequisites
- Node.js 18+
- pnpm 9.15+
- Supabase CLI (Optional, for local development)
- Docker & Docker Compose (Optional, for full stack environment)

### Key Commands
- `pnpm install`: 모든 의존성 설치
- `pnpm dev`: Turborepo를 이용한 전체 개발 서버 실행
- `pnpm dev:web`: 웹 애플리케이션만 실행
- `pnpm db:generate`: Supabase 로컬 스키마로부터 TypeScript 타입 생성
- `pnpm build`: 전체 프로젝트 빌드
- `pnpm typecheck`: 전체 타입 체크

### Environment Variables
- Root `.env` 파일 또는 `apps/web/.env.local`에서 관리
- 주요 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `TOSS_SECRET_KEY` 등

## Coding Conventions
- **Naming:** 컴포넌트는 PascalCase, 일반 함수 및 변수는 camelCase를 사용합니다.
- **Shared First:** 비즈니스 로직이나 타입은 최대한 `packages/shared` 또는 `packages/api`에 작성하여 웹/모바일 간 공유합니다.
- **UI Components:** UI 수정 시 `packages/ui`에 정의된 컴포넌트를 우선적으로 사용합니다.
- **Supabase Policies:** RLS(Row Level Security)를 준수하여 데이터 보안을 유지합니다.
