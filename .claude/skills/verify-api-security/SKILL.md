---
name: verify-api-security
description: API 라우트 보안 패턴 검증 (인증, 웹훅 서명, 원자적 상태 가드, 에러 응답 형식). API 라우트 추가/수정 후 사용.
---

# verify-api-security

## Purpose

1. **인증 검사** — 보호된 API 라우트에 `supabase.auth.getUser()` 인증 체크가 있는지 검증
2. **에러 응답 형식** — 모든 API 라우트가 `{ code, message }` 구조의 일관된 에러 응답을 반환하는지 검증
3. **원자적 상태 가드** — 상태 전환 시 `.eq("status", ...)` 또는 `.in("status", [...])` 가드를 사용하는지 검증
4. **웹훅 보안** — 웹훅 라우트에 HMAC-SHA256 서명 검증이 있는지 검증
5. **결제 멱등성** — 결제 관련 라우트에 중복 처리 방지 로직이 있는지 검증
6. **Rate Limiting** — 사용자 입력 처리 라우트(업로드, 파일 다운로드)에 rate limiting이 적용되어 있는지 검증

## When to Run

- API 라우트 파일(`apps/web/src/app/api/**/route.ts`)을 추가하거나 수정한 후
- 인증 또는 권한 로직을 변경한 후
- 결제 흐름(payment) 관련 코드를 수정한 후
- Supabase 상태 업데이트 로직을 변경한 후
- 에러 핸들링 패턴을 수정한 후

## Related Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/api/upload/route.ts` | 파일 업로드 핸들러 (features/upload/api 호출) |
| `apps/web/src/app/api/analyze/route.ts` | Claude 분석 트리거 핸들러 (features/analysis/api 호출) |
| `apps/web/src/app/api/analyses/route.ts` | 분석 목록 조회 핸들러 (entities/analysis/api 호출) |
| `apps/web/src/app/api/analyses/[id]/route.ts` | 단일 분석 조회/삭제 핸들러 (entities/analysis/api 호출) |
| `apps/web/src/app/api/analyses/[id]/file/route.ts` | 분석 파일 다운로드 핸들러 (entities/analysis/api 호출) |
| `apps/web/src/app/api/payment/route.ts` | 결제 생성 핸들러 (features/payment/api 호출) |
| `apps/web/src/app/api/payment/confirm/route.ts` | 결제 확인 핸들러 (features/payment/api 호출) |
| `apps/web/src/app/api/payment/webhook/route.ts` | Toss 웹훅 핸들러 (features/payment/api 호출) |
| `apps/web/src/app/api/payment/success/route.ts` | 결제 성공 리다이렉트 (GET, 공개) |
| `apps/web/src/app/api/payment/fail/route.ts` | 결제 실패 리다이렉트 (GET, 공개) |
| `apps/web/src/app/api/report/[id]/route.ts` | PDF 리포트 생성 핸들러 (features/analysis/api 호출) |
| `apps/web/src/app/api/consent/route.ts` | 사용자 동의 기록 핸들러 (entities/consent/api 호출) |
| `apps/web/src/app/api/auth/callback/route.ts` | OAuth 콜백 (GET, 리다이렉트 보호) |
| `apps/web/src/app/api/auth/mobile-callback/route.ts` | 모바일 OAuth 콜백 (GET) |
| `apps/web/src/features/upload/api/*.ts` | 파일 업로드 비즈니스 로직 (auth + admin) |
| `apps/web/src/features/analysis/api/*.ts` | 분석 비즈니스 로직 (auth + admin + 원자적 가드) |
| `apps/web/src/features/payment/api/*.ts` | 결제 비즈니스 로직 (auth + admin + 멱등성 + 웹훅 서명) |
| `apps/web/src/entities/analysis/api/*.ts` | 분석 CRUD 로직 (auth + RLS/admin) |
| `apps/web/src/entities/consent/api/*.ts` | 동의 CRUD 로직 (auth + RLS) |
| `apps/web/src/shared/api/supabase/admin.ts` | Admin 클라이언트 (RLS 우회) |
| `apps/web/src/shared/api/supabase/server.ts` | Server 클라이언트 (RLS 적용) |
| `apps/web/src/shared/lib/env.ts` | 환경변수 검증 |
| `apps/web/src/shared/lib/rate-limit.ts` | 인메모리 rate limiter 유틸리티 |
| `apps/web/src/shared/lib/auth.ts` | 인증 미들웨어 (`requireAuth()`, `isAuthError()`) |
| `apps/web/src/shared/lib/api-errors.ts` | 표준화된 API 에러 헬퍼 (`apiError()`, `notFound()`, `rateLimited()`, etc.) |

## Workflow

### Step 1: 보호된 라우트의 인증 검사 확인

**도구:** Grep

**검사:** 공개 라우트(success, fail, auth callback)를 제외한 모든 API 핸들러와 비즈니스 로직 파일에 `requireAuth()` 또는 `supabase.auth.getUser()` 호출이 있는지 확인합니다. 두 패턴 모두 유효합니다.

**참고:** FSD 아키텍처에서 인증 체크는 API 라우트 핸들러 또는 `features/*/api/`, `entities/*/api/` 비즈니스 로직 파일에 위치합니다. 새로운 핸들러는 `@/shared/lib/auth`의 `requireAuth()` 헬퍼를 사용합니다.

```bash
# API 라우트 핸들러 인증 체크
grep -rL "requireAuth\|auth\.getUser" apps/web/src/app/api/upload/route.ts apps/web/src/app/api/analyze/route.ts apps/web/src/app/api/analyses/route.ts "apps/web/src/app/api/analyses/[id]/route.ts" "apps/web/src/app/api/analyses/[id]/file/route.ts" apps/web/src/app/api/payment/route.ts apps/web/src/app/api/payment/confirm/route.ts apps/web/src/app/api/report/*/route.ts apps/web/src/app/api/consent/route.ts

# 비즈니스 로직 파일 인증 체크
grep -rL "requireAuth\|auth\.getUser" apps/web/src/features/upload/api/*.ts apps/web/src/features/analysis/api/*.ts apps/web/src/features/payment/api/*.ts apps/web/src/entities/analysis/api/*.ts apps/web/src/entities/consent/api/*.ts
```

**PASS:** 위 명령어의 출력이 비어있으면 (모든 보호 라우트/비즈니스 로직에 auth 체크 있음)
**FAIL:** 파일이 출력되면 해당 파일에 인증 체크 누락

**수정:** 누락된 파일에 다음 패턴 추가:
```typescript
import { requireAuth, isAuthError } from "@/shared/lib/auth";

const auth = await requireAuth();
if (isAuthError(auth)) return auth;
const { user, supabase } = auth;
```

### Step 2: 에러 응답 형식 일관성 확인

**도구:** Grep

**검사:** 모든 API 라우트에서 에러 응답이 `{ code: "...", message: "..." }` 형식을 따르는지 확인합니다.

**참고:** 핸들러들이 `@/shared/lib/api-errors`의 `apiError()`, `notFound()`, `rateLimited()` 등의 헬퍼를 사용하며, 이들은 모두 `{ code, message }` 형식을 보장합니다.

```
Grep: pattern="NextResponse\.json\(" path="apps/web/src/app/api/" glob="route.ts" output_mode="content"
→ 결과에서 "code:" 포함 행을 필터링하여, status 에러 응답에 code 필드가 없는 케이스를 찾음
→ 정상 응답(orderId, analysisId, result, analyses, redirect, pdf, blob)은 제외
```

**PASS:** 에러 응답에 항상 `code` 필드가 포함됨
**FAIL:** `code` 필드 없이 에러 상태를 반환하는 응답이 있음

### Step 3: 원자적 상태 가드 확인

**도구:** Grep

**검사:** 상태 변경(`.update(...)`)에 `.eq("status", ...)` 또는 `.in("status", ...)` 가드가 있는지 확인합니다.

```bash
# API 라우트 핸들러에서 상태 업데이트 가드 확인
grep -n "\.update(" apps/web/src/app/api/analyze/route.ts apps/web/src/app/api/payment/confirm/route.ts apps/web/src/app/api/payment/webhook/route.ts

# 비즈니스 로직 파일에서 상태 업데이트 가드 확인
grep -n "\.update(" apps/web/src/features/analysis/api/*.ts apps/web/src/features/payment/api/*.ts
```

```bash
# 원자적 가드 패턴 확인 (API 라우트)
grep -n '\.eq("status"\|\.in("status"' apps/web/src/app/api/analyze/route.ts apps/web/src/app/api/payment/confirm/route.ts

# 원자적 가드 패턴 확인 (비즈니스 로직)
grep -n '\.eq("status"\|\.in("status"' apps/web/src/features/analysis/api/*.ts apps/web/src/features/payment/api/*.ts
```

**PASS:** 상태 업데이트가 있는 곳에 `.eq("status", ...)` 또는 `.in("status", ...)` 가드가 존재
**FAIL:** 상태 업데이트에 가드 없이 직접 update

### Step 4: 웹훅 서명 검증 확인

**도구:** Grep

**검사:** 웹훅 라우트/비즈니스 로직에 HMAC-SHA256 서명 검증과 timing-safe 비교가 있는지 확인합니다.

```bash
# 웹훅 라우트 핸들러 서명 검증 패턴
grep -n "timingSafeEqual\|createHmac\|verifyWebhookSignature\|X-Toss-Signature" apps/web/src/app/api/payment/webhook/route.ts

# 웹훅 비즈니스 로직 서명 검증 패턴
grep -n "timingSafeEqual\|createHmac\|verifyWebhookSignature\|X-Toss-Signature" apps/web/src/features/payment/api/*.ts
```

**PASS:** `crypto.timingSafeEqual`, `createHmac("sha256"`, `X-Toss-Signature` 패턴이 모두 존재
**FAIL:** 서명 검증 로직 누락 또는 불완전

### Step 5: 결제 멱등성 확인

**도구:** Grep

**검사:** 결제 생성/확인 라우트/비즈니스 로직에 기존 결제 중복 체크 로직이 있는지 확인합니다.

```bash
# 결제 API 라우트 핸들러에서 중복 체크 확인
grep -n "existingPayment\|ALREADY_PROCESSED\|already\|idempoten" apps/web/src/app/api/payment/route.ts apps/web/src/app/api/payment/confirm/route.ts

# 결제 비즈니스 로직에서 중복 체크 확인
grep -n "existingPayment\|ALREADY_PROCESSED\|already\|idempoten" apps/web/src/features/payment/api/*.ts
```

**PASS:** 결제 생성/확인에 중복 체크 로직이 존재
**FAIL:** 중복 체크 없이 결제 처리

### Step 6: 오픈 리다이렉트 방지 확인

**도구:** Grep

**검사:** OAuth 콜백에서 리다이렉트 경로 검증이 있는지 확인합니다.

```bash
grep -n 'startsWith("/")\|startsWith("//")\|isValidRedirect' apps/web/src/app/api/auth/callback/route.ts
```

**PASS:** 리다이렉트 경로가 `/`로 시작하되 `//`로 시작하지 않는지 검증
**FAIL:** 리다이렉트 경로 검증 누락

### Step 7: Rate Limiting 확인

**도구:** Grep

**검사:** 사용자 입력을 처리하는 라우트/비즈니스 로직(업로드, 파일 다운로드)에 rate limiting이 적용되어 있는지 확인합니다.

```bash
# API 라우트 핸들러 rate limit 확인
grep -rL "checkRateLimit" apps/web/src/app/api/upload/route.ts "apps/web/src/app/api/analyses/[id]/file/route.ts"

# 비즈니스 로직 rate limit 확인
grep -rL "checkRateLimit" apps/web/src/features/upload/api/*.ts apps/web/src/entities/analysis/api/*.ts
```

**PASS:** 위 명령어의 출력이 비어있으면 (rate limiting 적용됨)
**FAIL:** 파일이 출력되면 해당 파일에 rate limiting 누락

**수정:** 누락된 파일에 다음 패턴 추가:
```typescript
import { checkRateLimit } from "@/shared/lib/rate-limit";

const { allowed } = checkRateLimit(`<action>:${user.id}`, <limit>, <windowMs>);
if (!allowed) {
  return NextResponse.json(
    { code: "RATE_LIMITED", message: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
    { status: 429 }
  );
}
```

## Output Format

| 검사 항목 | 상태 | 상세 |
|----------|------|------|
| 인증 검사 | PASS/FAIL | 미인증 라우트 목록 |
| 에러 응답 형식 | PASS/FAIL | 비표준 응답 위치 |
| 원자적 상태 가드 | PASS/FAIL | 가드 누락 위치 |
| 웹훅 서명 검증 | PASS/FAIL | 누락된 검증 요소 |
| 결제 멱등성 | PASS/FAIL | 중복 체크 누락 위치 |
| 오픈 리다이렉트 방지 | PASS/FAIL | 검증 누락 위치 |
| Rate Limiting | PASS/FAIL | rate limit 누락 라우트 |

## Exceptions

1. **공개 리다이렉트 라우트** — `payment/success/route.ts`, `payment/fail/route.ts`는 인증 체크가 불필요합니다 (결제 완료 후 사용자를 페이지로 보내는 단순 리다이렉트)
2. **OAuth 콜백 라우트** — `auth/callback/route.ts`, `auth/mobile-callback/route.ts`는 OAuth 흐름의 일부로 인증 전 단계이므로 `auth.getUser()` 체크가 불필요합니다
3. **성공 응답의 code 필드** — 정상 응답(`status: 200`)에서는 `code` 필드가 필수가 아닙니다. 에러 응답(`status >= 400`)에만 적용됩니다
