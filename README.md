# Contract Guardian (계약서 지킴이)

AI 기반 계약서 분석 플랫폼. 프리랜서와 소규모 사업자를 위해 계약서를 업로드하면 Claude AI가 8개 항목을 분석하고, 위험도를 점수화하며, PDF 리포트를 생성합니다.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 3.4, Radix UI |
| Mobile | Expo 52, React Native, NativeWind (Phase 2) |
| Database | Supabase (PostgreSQL), Supabase Auth, Supabase Storage |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Payment | Toss Payments |
| Build | pnpm workspaces, Turborepo |
| Language | TypeScript (strict mode) |

## Monorepo Structure

```
contract-guardian/
├── apps/
│   ├── web/           # Next.js 웹 앱 (@cg/web)
│   └── mobile/        # Expo 모바일 앱 (@cg/mobile) - Phase 2
├── packages/
│   ├── shared/        # 타입, 상수, 검증 스키마 (@cg/shared)
│   ├── api/           # API 클라이언트, Supabase 서비스, React hooks (@cg/api)
│   ├── ui/            # Radix 기반 + 애니메이션 컴포넌트 (@cg/ui)
│   └── config/        # 공유 tsconfig, ESLint, Tailwind 설정 (@cg/config)
└── supabase/          # 로컬 개발 설정 및 마이그레이션
```

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 9.15+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (로컬 DB 사용 시)

### Setup

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 Supabase, Anthropic, Toss Payments 키 입력

# Supabase 로컬 시작 (선택)
supabase start

# DB 타입 생성
pnpm db:generate

# 개발 서버 실행
pnpm dev:web
```

웹 앱이 `http://localhost:3000`에서 실행됩니다.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase 공개 (anon) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `TOSS_CLIENT_KEY` | Toss Payments 클라이언트 키 |
| `TOSS_SECRET_KEY` | Toss Payments 시크릿 키 |
| `APP_URL` | 앱 기본 URL (기본: `http://localhost:3000`) |
| `APP_NAME` | 앱 이름 (기본: `계약서 지킴이`) |
| `SENTRY_DSN` | Sentry DSN (선택) |

## Scripts

```bash
pnpm dev              # 전체 개발 서버 (Turbo)
pnpm dev:web          # 웹 앱만 실행
pnpm dev:mobile       # 모바일 앱만 실행
pnpm build            # 전체 빌드
pnpm typecheck        # 타입 체크
pnpm lint             # ESLint
pnpm clean            # 빌드 아티팩트 정리
pnpm db:generate      # Supabase 타입 생성
pnpm db:migrate       # DB 마이그레이션 적용
```

## How It Works

```
1. 계약서 업로드 (PDF / JPEG / PNG, 최대 20MB)
      ↓
2. 텍스트 추출 (PDF 파싱 또는 스캔 문서의 경우 이미지 모드)
      ↓
3. Supabase Storage 저장 + 분석 레코드 생성
      ↓
4. 결제 (Toss Payments)
      ↓
5. Claude AI 분석 (8개 조항 카테고리, 위험도 0-100 점수)
      ↓
6. 분석 결과 저장 + PDF 리포트 생성/다운로드
```

### Analysis Categories

| Category | Description |
|----------|-------------|
| Payment Terms | 대금/보수 지급 조건 |
| Scope of Work | 업무 범위 명확성 |
| Intellectual Property | 지식재산권 귀속 |
| Termination | 계약 해지 조건 |
| Warranty | 하자보증/하자담보 책임 |
| Confidentiality | 비밀유지 조항 |
| Liability | 손해배상 한도 |
| Dispute Resolution | 분쟁 해결 방법 |

### Analysis Status Flow

`pending_payment` → `paid` → `processing` → `completed` | `failed`

### Pricing

| Plan | Price | Condition |
|------|-------|-----------|
| Free | 0원 | 첫 1회 무료 |
| Standard | 3,900원 | 5페이지 이하 |
| Extended | 5,900원 | 6페이지 이상 |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/upload` | POST | 파일 업로드 + 텍스트 추출 |
| `/api/analyze/[id]` | POST | Claude 분석 실행 |
| `/api/analyses/[id]` | GET | 분석 결과 조회 |
| `/api/payment/confirm` | POST | 결제 확인 |
| `/api/payment/webhook` | POST | Toss 결제 웹훅 |
| `/api/report/[id]` | GET | PDF 리포트 다운로드 |
| `/api/auth/callback` | GET | OAuth 콜백 |

## License

Private
