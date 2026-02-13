---
name: verify-shared-packages
description: 워크스페이스 패키지 규칙 검증 (@cg/* 임포트, 타입-스키마 정합성, re-export). 패키지 코드 수정 후 사용.
---

# verify-shared-packages

## Purpose

1. **워크스페이스 임포트** — `@cg/shared`, `@cg/api`, `@cg/ui` 별칭만 사용하고 직접 상대경로 임포트가 없는지 검증
2. **Re-export 완전성** — 각 패키지의 `index.ts`가 모든 하위 모듈을 re-export하는지 검증
3. **타입-스키마 정합성** — TypeScript 타입과 Zod 스키마가 올바르게 정렬되어 있는지 검증
4. **상수 일관성** — 상수 값이 코드베이스 전체에서 일관되게 사용되는지 검증

## When to Run

- `packages/shared/src/` 하위 파일을 추가하거나 수정한 후
- `packages/api/src/` 또는 `packages/ui/src/` 파일을 수정한 후
- 새로운 타입, 상수, 또는 Zod 스키마를 추가한 후
- 패키지 간 의존성을 변경한 후

## Related Files

| File | Purpose |
|------|---------|
| `packages/shared/src/index.ts` | Shared 패키지 메인 re-export |
| `packages/shared/src/types/index.ts` | 타입 re-export |
| `packages/shared/src/validation/index.ts` | Zod 스키마 re-export |
| `packages/shared/src/constants/index.ts` | 상수 re-export |
| `packages/shared/src/utils/index.ts` | 유틸리티 re-export |
| `packages/shared/src/types/analysis.ts` | 분석 결과 타입 |
| `packages/shared/src/types/payment.ts` | 결제 타입 |
| `packages/shared/src/types/user.ts` | 사용자 타입 |
| `packages/shared/src/types/api.ts` | API 요청/응답 타입 |
| `packages/shared/src/types/database.ts` | Supabase 자동 생성 타입 |
| `packages/shared/src/validation/analysis.ts` | 분석 결과 Zod 스키마 |
| `packages/shared/src/validation/payment.ts` | 결제 Zod 스키마 |
| `packages/shared/src/validation/upload.ts` | 업로드 Zod 스키마 |
| `packages/shared/src/constants/pricing.ts` | 가격 상수 |
| `packages/shared/src/constants/analysis.ts` | 분석 관련 상수 (파일 크기, 포맷) |
| `packages/shared/src/constants/risk-levels.ts` | 리스크 임계값/색상 |
| `packages/shared/src/constants/contract-types.ts` | 계약서 유형 |
| `packages/shared/src/constants/routes.ts` | 라우트 상수 |
| `packages/shared/src/constants/clauses.ts` | 8개 조항 타입 메타데이터 |
| `packages/shared/src/constants/providers.ts` | AI 제공자 설정 |
| `packages/api/src/index.ts` | API 패키지 메인 re-export |
| `packages/ui/src/index.ts` | UI 패키지 메인 re-export |

## Workflow

### Step 1: 직접 상대경로 임포트 방지

**도구:** Grep

**검사:** `apps/` 디렉토리에서 `packages/`로의 직접 상대경로 임포트가 없는지 확인합니다.

```
Grep: pattern="from ['\"]\.\..*packages/" path="apps/" glob="*.{ts,tsx}" output_mode="content"
Grep: pattern="from ['\"].*\/packages\/" path="apps/" glob="*.{ts,tsx}" output_mode="content"
```

**PASS:** 출력이 비어있음 (모든 임포트가 `@cg/*` 별칭 사용)
**FAIL:** 직접 경로로 패키지를 임포트하는 파일이 있음

**수정:** `@cg/shared`, `@cg/api`, `@cg/ui` 별칭으로 교체

### Step 2: Constants re-export 완전성 확인

**도구:** Bash, Grep

**검사:** `packages/shared/src/constants/` 디렉토리의 모든 `.ts` 파일이 `index.ts`에서 re-export되는지 확인합니다.

```bash
# constants 디렉토리의 모든 모듈 파일 (index.ts 제외)
ls packages/shared/src/constants/*.ts | grep -v index.ts | sed 's|.*/||;s|\.ts||'
```

```bash
# index.ts에서 export하는 모듈 목록
grep "export.*from" packages/shared/src/constants/index.ts | sed "s|.*'\./||;s|'.*||"
```

**PASS:** 두 목록이 일치
**FAIL:** re-export 되지 않은 파일이 존재

### Step 3: Types re-export 완전성 확인

**도구:** Bash, Grep

**검사:** `packages/shared/src/types/` 디렉토리의 모든 `.ts` 파일이 `index.ts`에서 re-export되는지 확인합니다.

```bash
# types 디렉토리의 모든 모듈 파일
ls packages/shared/src/types/*.ts | grep -v index.ts | sed 's|.*/||;s|\.ts||'
```

```bash
# index.ts에서 export하는 모듈 목록
grep "export.*from" packages/shared/src/types/index.ts | sed "s|.*'\./||;s|'.*||"
```

**PASS:** 두 목록이 일치
**FAIL:** re-export 되지 않은 타입 파일이 존재

### Step 4: Validation re-export 완전성 확인

**도구:** Bash, Grep

**검사:** `packages/shared/src/validation/` 디렉토리의 모든 `.ts` 파일이 `index.ts`에서 re-export되는지 확인합니다.

```bash
# validation 디렉토리의 모든 모듈 파일
ls packages/shared/src/validation/*.ts | grep -v index.ts | sed 's|.*/||;s|\.ts||'
```

```bash
# index.ts에서 export하는 모듈 목록
grep "export.*from" packages/shared/src/validation/index.ts | sed "s|.*'\./||;s|'.*||"
```

**PASS:** 두 목록이 일치
**FAIL:** re-export 되지 않은 스키마 파일이 존재

### Step 5: 패키지 간 의존성 방향 확인

**도구:** Grep

**검사:** 패키지 간 의존성이 올바른 방향인지 확인합니다 (shared → api → apps, shared → ui → apps).

```
Grep: pattern="@cg/api|@cg/ui" path="packages/shared/src/" glob="*.ts" output_mode="content"
Grep: pattern="@cg/ui" path="packages/api/src/" glob="*.ts" output_mode="content"
```

**PASS:** 출력이 비어있음 (의존성 방향 올바름)
**FAIL:** 역방향 의존성이 존재

## Output Format

| 검사 항목 | 상태 | 상세 |
|----------|------|------|
| 워크스페이스 임포트 | PASS/FAIL | 직접 경로 임포트 파일 |
| Constants re-export | PASS/FAIL | 누락된 re-export |
| Types re-export | PASS/FAIL | 누락된 re-export |
| Validation re-export | PASS/FAIL | 누락된 re-export |
| 의존성 방향 | PASS/FAIL | 역방향 임포트 |

## Exceptions

1. **`packages/shared/src/types/database.ts`** — Supabase CLI로 자동 생성되는 파일이므로 직접 편집하지 않음. `pnpm db:generate`로 갱신
2. **`packages/config/`** — 설정 패키지(`@cg/config`)는 tsconfig, ESLint 등 빌드 도구 설정만 포함하며 런타임 코드가 아니므로 re-export 검증 대상이 아님
3. **`packages/ui/src/lib/utils.ts`** — `cn()` 유틸리티가 `@cg/shared`를 임포트하지 않고 자체 `clsx + tailwind-merge` 구현을 사용하는 것은 정상 (UI 패키지의 독립성 유지)
