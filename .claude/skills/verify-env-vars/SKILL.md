---
name: verify-env-vars
description: 환경변수 규칙 검증 (NEXT_PUBLIC_* 접두사, turbo.json globalEnv, 런타임 검증). 환경변수 추가/수정 후 사용.
---

# verify-env-vars

## Purpose

1. **선언 동기화** — `.env.example`의 모든 변수가 `turbo.json` globalEnv에 선언되어 있는지 검증
2. **런타임 검증** — 서버 전용 환경변수가 `env.ts` Zod 스키마에서 검증되는지 확인
3. **접두사 규칙** — 클라이언트에 노출되는 변수에 `NEXT_PUBLIC_*` 접두사가 올바르게 사용되는지 검증
4. **보안** — 서버 전용 키(SECRET, SERVICE_ROLE 등)가 클라이언트 코드에서 참조되지 않는지 검증

## When to Run

- 새로운 환경변수를 추가한 후
- `.env.example`, `turbo.json`, 또는 `env.ts`를 수정한 후
- API 키를 사용하는 새 기능을 추가한 후
- 클라이언트/서버 경계를 변경한 후

## Related Files

| File | Purpose |
|------|---------|
| `.env.example` | 환경변수 템플릿 (전체 변수 목록의 소스) |
| `turbo.json` | Turborepo globalEnv (빌드 캐시 무효화 기준) |
| `apps/web/src/lib/env.ts` | 서버 환경변수 Zod 검증 |
| `apps/web/next.config.ts` | NEXT_PUBLIC_* 변수 자동 주입 |
| `apps/web/src/lib/supabase/admin.ts` | SUPABASE_SERVICE_ROLE_KEY 사용 |
| `apps/web/src/lib/supabase/server.ts` | NEXT_PUBLIC_SUPABASE_* 사용 |
| `apps/web/src/lib/supabase/client.ts` | NEXT_PUBLIC_SUPABASE_* 사용 |
| `.env.docker` | Docker 개발 환경변수 템플릿 |
| `.env.prod` | 프로덕션 환경변수 템플릿 (원격 Supabase 연결) |

## Workflow

### Step 1: .env.example과 turbo.json globalEnv 동기화 확인

**도구:** Bash

**검사:** `.env.example`에 선언된 모든 변수가 `turbo.json`의 `globalEnv`에 포함되어 있는지 확인합니다.

```bash
# .env.example의 변수 목록 (주석/빈줄 제외)
grep -E "^[A-Z_]+" .env.example | cut -d= -f1 | sort

# turbo.json globalEnv 목록
grep -oP '"[A-Z_]+"' turbo.json | tr -d '"' | sort
```

**PASS:** .env.example의 모든 변수가 turbo.json에 존재 (NODE_ENV는 turbo에만 있어도 정상)
**FAIL:** .env.example에 있지만 turbo.json에 없는 변수가 있음

**수정:** 누락된 변수를 `turbo.json`의 `globalEnv` 배열에 추가

### Step 2: 서버 전용 변수의 env.ts 검증 확인

**도구:** Grep

**검사:** `NEXT_PUBLIC_*` 접두사가 없는 서버 전용 변수가 `env.ts`에서 검증되는지 확인합니다.

```bash
# .env.example의 서버 전용 변수 (NEXT_PUBLIC이 아닌 것)
grep -E "^[A-Z_]+" .env.example | cut -d= -f1 | grep -v "^NEXT_PUBLIC_" | sort
```

```bash
# env.ts에서 검증하는 변수 목록
grep -oE "[A-Z_]+" apps/web/src/lib/env.ts | grep -v "z\|string\|min\|url\|object\|env\|NEXT_PHASE\|NODE_ENV\|process\|PLACEHOLDER" | sort -u
```

**PASS:** 필수 서버 전용 변수가 모두 env.ts에서 검증됨
**FAIL:** 검증되지 않는 필수 서버 전용 변수가 있음

### Step 3: 서버 전용 키가 클라이언트 코드에서 참조되지 않는지 확인

**도구:** Grep

**검사:** `SECRET`, `SERVICE_ROLE` 등 서버 전용 키가 클라이언트 컴포넌트에서 참조되지 않는지 확인합니다.

```
Grep: pattern="SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|TOSS_SECRET_KEY|GOOGLE_GEMINI_API_KEY" path="apps/web/src/components/" glob="*.{ts,tsx}" output_mode="content"
Grep: pattern="SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|TOSS_SECRET_KEY|GOOGLE_GEMINI_API_KEY" path="apps/web/src/hooks/" glob="*.{ts,tsx}" output_mode="content"
```

**PASS:** 출력이 비어있음 (클라이언트 코드에서 서버 전용 키 미참조)
**FAIL:** 클라이언트 코드에서 서버 전용 키를 참조하는 파일이 있음

### Step 4: NEXT_PUBLIC_* 접두사 일관성 확인

**도구:** Grep

**검사:** 클라이언트에서 사용되는 환경변수에 `NEXT_PUBLIC_*` 접두사가 있는지 확인합니다.

```
Grep: pattern="process\.env\." path="apps/web/src/components/" glob="*.{ts,tsx}" output_mode="content"
Grep: pattern="process\.env\." path="apps/web/src/hooks/" glob="*.{ts,tsx}" output_mode="content"
→ 결과에서 "NEXT_PUBLIC_" 포함 행을 제외하고 확인
```

**PASS:** 클라이언트에서 `process.env` 참조 시 항상 `NEXT_PUBLIC_*` 접두사 사용
**FAIL:** `NEXT_PUBLIC_*` 없이 `process.env`를 참조하는 클라이언트 코드가 있음

### Step 5: 플레이스홀더 시크릿 프로덕션 차단 확인

**도구:** Grep

**검사:** `env.ts`에 플레이스홀더 시크릿 감지 로직이 있는지 확인합니다.

```bash
grep -n "PLACEHOLDER_SECRETS\|placeholder\|phase-production-build" apps/web/src/lib/env.ts
```

**PASS:** 플레이스홀더 시크릿 배열과 프로덕션 빌드 단계 감지 로직이 존재
**FAIL:** 플레이스홀더 감지 로직 누락

### Step 6: 빌드/런타임 환경변수 분리 검증

**도구:** Grep

**검사:** `env.ts`에서 서버 전용 키가 빌드 시 optional, 런타임 시 필수로 처리되는지 확인합니다.

```bash
# isBuildPhase 분기 존재 확인
grep -n "isBuildPhase\|NEXT_PHASE.*phase-production-build" apps/web/src/lib/env.ts

# 서버 전용 키가 optional()로 파싱되는지 확인
grep -n "optional()" apps/web/src/lib/env.ts

# 런타임 필수 검증 로직 존재 확인
grep -n "missingKeys\|requiredServerKeys" apps/web/src/lib/env.ts
```

**PASS:** `isBuildPhase` 분기가 존재하고, 서버 키가 Zod에서 optional + 런타임 수동 필수 검증
**FAIL:** 서버 키가 Zod에서 항상 required → Docker 빌드 시 서버 전용 키 없이 빌드 불가

### Step 7: .env.prod과 .env.example 변수 일관성 확인

**도구:** Bash

**검사:** `.env.prod`의 앱 환경변수가 `.env.example`과 일치하는지 확인합니다 (DB/JWT/Studio 전용 변수 제외).

```bash
# .env.example의 앱 변수 (POSTGRES_, JWT_, DASHBOARD_, API_EXTERNAL_URL 제외)
grep -E "^[A-Z_]+" .env.example | cut -d= -f1 | grep -v "^POSTGRES_\|^JWT_\|^DASHBOARD_\|^API_EXTERNAL_\|^ANON_KEY\|^SERVICE_ROLE_KEY" | sort

# .env.prod의 변수
grep -E "^[A-Z_]+" .env.prod | cut -d= -f1 | sort
```

**PASS:** `.env.prod`에 `.env.example`의 모든 앱 변수가 존재
**FAIL:** `.env.prod`에 누락된 앱 변수가 있음

### Step 8: next.config.ts ENV_FILE 환경 분리 로딩 확인

**도구:** Grep

**검사:** `next.config.ts`에서 `ENV_FILE` 환경변수를 통한 env 파일 분리 로딩이 작동하는지 확인합니다.

```bash
grep -n "ENV_FILE\|dotenvConfig" apps/web/next.config.ts
```

**PASS:** `ENV_FILE` 변수로 다른 env 파일 지정 가능 (기본값 `.env`)
**FAIL:** 하드코딩된 `.env` 경로만 사용

## Output Format

| 검사 항목 | 상태 | 상세 |
|----------|------|------|
| .env.example ↔ turbo.json 동기화 | PASS/FAIL | 누락된 변수 |
| 서버 변수 런타임 검증 | PASS/FAIL | 검증 안 된 변수 |
| 서버 키 클라이언트 노출 | PASS/FAIL | 노출된 키와 파일 |
| NEXT_PUBLIC_* 접두사 | PASS/FAIL | 접두사 누락 위치 |
| 플레이스홀더 차단 | PASS/FAIL | 차단 로직 상태 |

## Exceptions

1. **`NODE_ENV`** — `turbo.json`에만 존재하고 `.env.example`에 없는 것이 정상 (시스템 런타임 변수)
2. **선택적 변수** — `GOOGLE_GEMINI_API_KEY`, `SENTRY_DSN`은 선택적이므로 env.ts에서 optional로 처리되어도 정상
3. **`next.config.ts`의 서버 변수 참조** — 빌드 설정 파일에서 서버 전용 변수를 읽는 것은 정상 (빌드 시점에만 실행됨, 클라이언트 번들에 포함되지 않음)
4. **`env.ts`의 `as RuntimeEnv` 타입 단언** — 빌드 시 optional이지만 런타임에서 수동 필수 검증 후 캐스팅하므로 정상
5. **`.env.prod`에 DB/JWT/Studio 변수 없음** — 프로덕션에서는 원격 Supabase를 사용하므로 로컬 DB 관련 변수(`POSTGRES_*`, `JWT_SECRET`, `DASHBOARD_*`)가 불필요
