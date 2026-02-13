---
name: verify-implementation
description: 등록된 모든 검증 스킬을 순차 실행하여 코드베이스 일관성을 확인합니다. PR 전이나 주요 변경 후 사용.
---

# verify-implementation

## Purpose

등록된 모든 검증 스킬을 순차적으로 실행하여 코드베이스의 규칙 준수를 종합적으로 확인합니다.

## When to Run

- PR을 생성하기 전
- 여러 파일에 걸친 대규모 변경 후
- 새로운 기능을 구현한 후
- 리팩토링 완료 후

## 실행 대상 스킬

| # | 스킬 | 설명 |
|---|------|------|
| 1 | `verify-api-security` | API 라우트 보안 패턴 검증 |
| 2 | `verify-supabase-clients` | Supabase 클라이언트 사용 규칙 검증 |
| 3 | `verify-shared-packages` | 워크스페이스 패키지 규칙 검증 |
| 4 | `verify-env-vars` | 환경변수 규칙 검증 |

## Workflow

### Step 1: 각 검증 스킬 순차 실행

위 테이블의 순서대로 각 스킬을 실행합니다. 각 스킬의 SKILL.md에 정의된 Workflow를 따릅니다.

### Step 2: 종합 결과 보고

모든 스킬 실행 후 결과를 종합합니다.

## Output Format

```markdown
## 종합 검증 결과

| # | 스킬 | 결과 | 이슈 수 |
|---|------|------|---------|
| 1 | verify-api-security | PASS/FAIL | N |
| 2 | verify-supabase-clients | PASS/FAIL | N |
| 3 | verify-shared-packages | PASS/FAIL | N |
| 4 | verify-env-vars | PASS/FAIL | N |

### 총 이슈: N개
### 상세 이슈 목록:
(각 스킬별 FAIL 항목 나열)
```

## Exceptions

1. **개별 스킬의 예외사항** — 각 스킬의 Exceptions 섹션에 명시된 항목은 FAIL로 카운트하지 않음
2. **부분 실행** — 특정 스킬만 실행하려면 인수로 스킬 이름을 전달 (예: `verify-api-security`)
