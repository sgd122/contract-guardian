---
name: verify-supabase-clients
description: Supabase 클라이언트 사용 규칙 검증 (client/server/admin 분리, RLS 적용). Supabase 관련 코드 수정 후 사용.
---

# verify-supabase-clients

## Purpose

1. **클라이언트 분리** — browser(client), server, admin 클라이언트가 올바른 컨텍스트에서만 사용되는지 검증
2. **Admin 클라이언트 제한** — `createAdminClient()`가 API 라우트(`app/api/`)에서만 사용되는지 검증
3. **RLS 우회 최소화** — admin 클라이언트 사용이 정당한 시스템 작업에만 한정되는지 검증
4. **임포트 일관성** — Supabase 클라이언트 임포트 경로가 일관되게 사용되는지 검증

## When to Run

- Supabase 클라이언트를 사용하는 코드를 추가하거나 수정한 후
- API 라우트에서 데이터 접근 패턴을 변경한 후
- 새 컴포넌트에서 Supabase를 사용하기 시작한 후
- RLS 정책을 변경한 후

## Related Files

| File | Purpose |
|------|---------|
| `apps/web/src/lib/supabase/client.ts` | 브라우저 클라이언트 (RLS 적용) |
| `apps/web/src/lib/supabase/server.ts` | 서버 클라이언트 (RLS 적용, 쿠키 기반 인증) |
| `apps/web/src/lib/supabase/admin.ts` | Admin 클라이언트 (RLS 우회, 서비스 역할 키) |
| `apps/web/src/app/api/upload/route.ts` | Admin 사용 (스토리지 + DB 삽입) |
| `apps/web/src/app/api/analyze/route.ts` | Admin 사용 (상태 업데이트) |
| `apps/web/src/app/api/payment/route.ts` | Admin 사용 (결제 생성) |
| `apps/web/src/app/api/payment/confirm/route.ts` | Admin 사용 (결제 확인) |
| `apps/web/src/app/api/payment/webhook/route.ts` | Admin 사용 (웹훅 처리) |
| `apps/web/src/app/api/analyses/route.ts` | Server 사용 (RLS로 사용자 데이터 필터링) |
| `apps/web/src/app/api/analyses/[id]/route.ts` | Server 사용 (RLS로 단일 분석 조회) + Admin 사용 (DELETE: 스토리지 삭제) |
| `apps/web/src/app/api/analyses/[id]/file/route.ts` | Server 사용 (RLS로 파일 다운로드) |
| `apps/web/src/app/api/report/[id]/route.ts` | Server 사용 (RLS로 리포트 조회) |
| `apps/web/src/app/api/consent/route.ts` | Server 사용 (RLS로 동의 기록) |

## Workflow

### Step 1: Admin 클라이언트가 API 라우트 외부에서 사용되지 않는지 확인

**도구:** Grep

**검사:** `createAdminClient` 임포트가 `app/api/` 디렉토리 내부에서만 발생하는지 확인합니다.

```
Grep: pattern="createAdminClient|from.*supabase/admin" path="apps/web/src/" glob="*.{ts,tsx}" output_mode="content"
→ 결과에서 "app/api/"와 "lib/supabase/admin.ts" 경로를 제외하고 확인
```

**PASS:** 출력이 비어있음 (API 라우트 외부에서 admin 클라이언트 미사용)
**FAIL:** API 라우트 외부에서 admin 클라이언트를 임포트하는 파일이 있음

**수정:** 해당 파일에서 `createAdminClient` 대신 `createClient` (server.ts)를 사용하도록 변경

### Step 2: 브라우저 클라이언트가 서버 컴포넌트에서 사용되지 않는지 확인

**도구:** Grep

**검사:** `@/lib/supabase/client` 임포트가 서버 컴포넌트나 API 라우트에서 사용되지 않는지 확인합니다.

```
Grep: pattern="from.*supabase/client" path="apps/web/src/app/api/" glob="*.ts" output_mode="content"
```

**PASS:** 출력이 비어있음 (API 라우트에서 브라우저 클라이언트 미사용)
**FAIL:** API 라우트에서 브라우저 클라이언트를 임포트하는 파일이 있음

### Step 3: 서버 클라이언트 임포트 일관성 확인

**도구:** Grep

**검사:** 서버 클라이언트 임포트가 일관된 경로(`@/lib/supabase/server`)를 사용하는지 확인합니다.

```
Grep: pattern="createClient.*from" path="apps/web/src/app/api/" glob="*.ts" output_mode="content"
→ 결과에서 "supabase/server", "supabase/admin", "@supabase" 포함 행을 제외하고 확인
```

**PASS:** 모든 서버 클라이언트가 `@/lib/supabase/server`에서 임포트됨
**FAIL:** 다른 경로에서 `createClient`를 임포트하는 파일이 있음

### Step 4: SUPABASE_SERVICE_ROLE_KEY 직접 사용 방지

**도구:** Grep

**검사:** `SUPABASE_SERVICE_ROLE_KEY`가 `admin.ts` 외부에서 직접 참조되지 않는지 확인합니다.

```
Grep: pattern="SUPABASE_SERVICE_ROLE_KEY|service_role" path="apps/web/src/" glob="*.{ts,tsx}" output_mode="content"
→ 결과에서 "lib/supabase/admin.ts", "lib/env.ts", ".d.ts" 경로를 제외하고 확인
```

**PASS:** admin.ts와 env.ts 외부에서 SERVICE_ROLE_KEY 미참조
**FAIL:** 다른 파일에서 SERVICE_ROLE_KEY를 직접 사용

### Step 5: Admin 클라이언트 설정 확인

**도구:** Read

**검사:** admin 클라이언트가 `autoRefreshToken: false`, `persistSession: false`로 설정되어 있는지 확인합니다.

```bash
grep -n "autoRefreshToken\|persistSession" apps/web/src/lib/supabase/admin.ts
```

**PASS:** 두 설정이 모두 `false`로 설정됨
**FAIL:** 설정이 누락되거나 `true`로 설정됨

## Output Format

| 검사 항목 | 상태 | 상세 |
|----------|------|------|
| Admin 라우트 제한 | PASS/FAIL | API 외부 사용처 |
| 브라우저/서버 분리 | PASS/FAIL | 잘못된 임포트 위치 |
| 임포트 경로 일관성 | PASS/FAIL | 비표준 경로 |
| SERVICE_ROLE_KEY 캡슐화 | PASS/FAIL | 직접 참조 위치 |
| Admin 클라이언트 설정 | PASS/FAIL | 잘못된 설정값 |

## Exceptions

1. **`lib/supabase/admin.ts` 자체** — admin 클라이언트 정의 파일이므로 `SUPABASE_SERVICE_ROLE_KEY` 사용이 정상
2. **`lib/env.ts`** — 환경변수 검증 스키마에서 `SUPABASE_SERVICE_ROLE_KEY`를 참조하는 것은 정상
3. **`packages/api/src/` 서비스** — 서비스 팩토리 함수는 외부에서 클라이언트를 주입받으므로 (`createXService(client)`), 서비스 자체에서 클라이언트를 생성하지 않음. 이는 정상 패턴
