---
name: verify-component-design
description: 컴포넌트 설계 원칙 검증 (단일 책임, 합성 패턴, Headless UI). 컴포넌트 추가/수정 후 사용.
---

# verify-component-design

## Purpose

React 컴포넌트와 함수의 설계 원칙 준수를 검증합니다:

1. **단일 책임 원칙 (SRP)** — 하나의 컴포넌트는 하나의 역할만 담당
2. **합성(Composition) 우선** — Props drilling보다 children과 합성 패턴 활용
3. **Headless UI 패턴** — 로직과 UI 분리, 커스텀 훅으로 로직 추출, UI 컴포넌트는 표현에만 집중

## When to Run

- 새로운 컴포넌트를 생성한 후
- 기존 컴포넌트에 기능을 추가한 후
- `features/*/ui/`, `widgets/`, `entities/*/ui/`, `_pages/` 파일을 수정한 후
- PR 전 컴포넌트 품질 점검

## Related Files

| File | Purpose |
|------|---------|
| `apps/web/src/features/*/ui/*.tsx` | Feature UI 컴포넌트 |
| `apps/web/src/features/*/hooks/*.ts` | Feature 커스텀 훅 (로직 분리 대상) |
| `apps/web/src/entities/*/ui/*.tsx` | Entity UI 컴포넌트 |
| `apps/web/src/widgets/**/*.tsx` | Widget 컴포넌트 |
| `apps/web/src/_pages/**/*.tsx` | Page 컴포지션 컴포넌트 |
| `packages/ui/src/components/ui/*.tsx` | 공유 UI 컴포넌트 (Radix 기반) |
| `packages/ui/src/components/animated/*.tsx` | 애니메이션 컴포넌트 |

## Workflow

### Step 1: 단일 책임 원칙 (SRP) 검증

컴포넌트가 하나의 역할에 집중하는지 확인합니다.

#### 1a. 컴포넌트 파일 크기 확인

**도구:** Bash

```bash
# features/ui, entities/ui, widgets 컴포넌트의 라인 수 확인
find apps/web/src/features/*/ui apps/web/src/entities/*/ui apps/web/src/widgets -name "*.tsx" -exec wc -l {} + | sort -rn | head -20
```

**PASS 기준:** 개별 컴포넌트 파일이 150줄 이하
**WARNING 기준:** 150~250줄 — 분리 검토 필요
**FAIL 기준:** 250줄 초과 — 반드시 분리 필요

> `_pages/` 컴포넌트는 여러 위젯/피처를 조합하므로 200줄까지 허용

#### 1b. useState 과다 사용 확인

**도구:** Grep

```bash
# 파일별 useState 호출 횟수 확인
grep -rc "useState" apps/web/src/features/*/ui/ apps/web/src/entities/*/ui/ apps/web/src/widgets/ apps/web/src/_pages/ --include="*.tsx" | grep -v ":0$" | sort -t: -k2 -rn
```

**PASS 기준:** 파일당 useState 3개 이하
**WARNING 기준:** 4~5개 — 커스텀 훅 추출 검토
**FAIL 기준:** 6개 이상 — 반드시 커스텀 훅으로 분리

#### 1c. 복수 핸들러 함수 확인

**도구:** Grep

```bash
# UI 컴포넌트에서 핸들러 함수 정의 개수 확인
grep -rc "const handle\|async function handle" apps/web/src/features/*/ui/ apps/web/src/entities/*/ui/ apps/web/src/widgets/ --include="*.tsx" | grep -v ":0$" | sort -t: -k2 -rn
```

**PASS 기준:** 파일당 핸들러 2개 이하
**WARNING 기준:** 3개 — 커스텀 훅 추출 검토
**FAIL 기준:** 4개 이상 — 비즈니스 로직을 훅으로 분리

### Step 2: 합성(Composition) 패턴 검증

Props drilling 대신 합성 패턴을 사용하는지 확인합니다.

#### 2a. Props 개수 확인

**도구:** Grep (multiline)

```bash
# interface/type Props 정의에서 속성 개수 확인
grep -A 20 "interface.*Props\|type.*Props" apps/web/src/features/*/ui/*.tsx apps/web/src/entities/*/ui/*.tsx apps/web/src/widgets/**/*.tsx | grep -c ":"
```

대안으로, 각 Props 인터페이스를 Read로 확인합니다.

**PASS 기준:** Props 속성 5개 이하
**WARNING 기준:** 6~8개 — 합성 패턴이나 컨텍스트 도입 검토
**FAIL 기준:** 9개 이상 — 반드시 합성 패턴으로 리팩토링

#### 2b. children 활용 확인

**도구:** Grep

```bash
# 레이아웃/컨테이너 컴포넌트에서 children 사용 확인
grep -l "children" apps/web/src/widgets/**/*.tsx apps/web/src/_pages/**/*.tsx
```

**정보성 검사:** 레이아웃/컨테이너 역할의 컴포넌트가 children을 활용하고 있는지 확인. children 미사용이 반드시 위반은 아니지만, 컨테이너/레이아웃 패턴에서는 권장됩니다.

#### 2c. 동일 prop 전달 체인 확인

**도구:** Grep

```bash
# 동일한 prop 이름이 부모→자식으로 그대로 전달되는 패턴 감지
grep -n "={.*}" apps/web/src/features/*/ui/*.tsx apps/web/src/_pages/**/*.tsx | grep -E "\w+=\{\w+\}" | head -20
```

**정보성 검사:** 3단계 이상 동일 prop이 전달되면 Context API 또는 합성 패턴 도입을 검토합니다.

### Step 3: Headless UI 패턴 검증

UI 컴포넌트에서 비즈니스 로직이 분리되어 있는지 확인합니다.

#### 3a. UI 컴포넌트의 fetch/API 호출 확인

**도구:** Grep

```bash
# features/ui, entities/ui 컴포넌트에서 직접 fetch/API 호출 확인
grep -rn "await fetch\|\.post(\|\.get(\|\.delete(\|\.put(\|\.patch(" apps/web/src/features/*/ui/ apps/web/src/entities/*/ui/ --include="*.tsx"
```

**PASS 기준:** UI 컴포넌트에서 직접 fetch/API 호출 없음
**FAIL 기준:** UI 컴포넌트에서 직접 fetch 호출 — 커스텀 훅으로 분리 필요

> `_pages/` 컴포넌트는 조합 레이어이므로 이 검사에서 제외

#### 3b. UI 컴포넌트에서 복잡한 비즈니스 로직 확인

**도구:** Grep

```bash
# UI 컴포넌트에서 try/catch 블록 확인 (비즈니스 에러 처리 = 로직)
grep -rc "try {" apps/web/src/features/*/ui/ apps/web/src/entities/*/ui/ --include="*.tsx" | grep -v ":0$"
```

**PASS 기준:** UI 컴포넌트에서 try/catch 없음 (에러 처리는 훅에서)
**WARNING 기준:** 단순 UI 에러 처리 1개 — 허용하되 검토
**FAIL 기준:** 2개 이상 — 비즈니스 로직을 커스텀 훅으로 분리

#### 3c. 훅-UI 분리 구조 확인

**도구:** Glob, Grep

```bash
# features에서 ui/는 있지만 hooks/가 없는 경우 확인
for dir in apps/web/src/features/*/; do
  feature=$(basename "$dir")
  has_ui=$(ls "$dir/ui/" 2>/dev/null | wc -l)
  has_hooks=$(ls "$dir/hooks/" 2>/dev/null | wc -l)
  if [ "$has_ui" -gt 0 ] && [ "$has_hooks" -eq 0 ]; then
    echo "WARNING: features/$feature — ui/ 있지만 hooks/ 없음"
  fi
done
```

**PASS 기준:** UI가 있는 모든 feature에 대응하는 hooks/ 디렉토리 존재
**WARNING 기준:** hooks/ 없음 — UI가 단순한 표현 컴포넌트만이라면 허용
**FAIL 기준:** UI에 비즈니스 로직이 있는데 hooks/가 없는 경우

#### 3d. _pages 컴포넌트의 로직 범위 확인

**도구:** Grep

```bash
# _pages 컴포넌트에서 useState 개수 확인 (조합 레이어는 최소한의 상태만)
grep -rc "useState" apps/web/src/_pages/ --include="*.tsx" | grep -v ":0$" | sort -t: -k2 -rn
```

**PASS 기준:** _pages 컴포넌트에서 useState 2개 이하 (라우팅/UI 토글 정도)
**WARNING 기준:** 3~4개 — 로직이 feature 훅에 있는지 확인
**FAIL 기준:** 5개 이상 — 비즈니스 로직을 feature 훅으로 분리 필요

### Step 4: 결과 종합

모든 검사 결과를 종합하여 보고합니다.

## Output Format

```markdown
## 컴포넌트 설계 원칙 검증 결과

### 1. 단일 책임 원칙 (SRP)

| 검사 | 결과 | 상세 |
|------|------|------|
| 파일 크기 (>150줄) | PASS/WARN/FAIL | 위반 파일 목록 |
| useState 과다 (>3개) | PASS/WARN/FAIL | 위반 파일 목록 |
| 핸들러 과다 (>2개) | PASS/WARN/FAIL | 위반 파일 목록 |

### 2. 합성(Composition) 패턴

| 검사 | 결과 | 상세 |
|------|------|------|
| Props 개수 (>5개) | PASS/WARN/FAIL | 위반 파일 목록 |
| children 활용 | INFO | 컨테이너 컴포넌트 확인 |

### 3. Headless UI 패턴

| 검사 | 결과 | 상세 |
|------|------|------|
| UI에서 fetch 호출 | PASS/FAIL | 위반 파일 목록 |
| UI에서 try/catch | PASS/WARN/FAIL | 위반 파일 목록 |
| 훅-UI 분리 구조 | PASS/WARN/FAIL | 미분리 feature 목록 |
| _pages useState 범위 | PASS/WARN/FAIL | 위반 파일 목록 |

### 총 이슈: N개 (FAIL: X, WARNING: Y)
### 권장 리팩토링:
(FAIL/WARNING 항목별 구체적 개선 방안)
```

## Exceptions

다음은 **위반이 아닙니다**:

1. **`_pages/` 컴포넌트의 크기** — Page 컴포지션은 여러 위젯/피처를 조합하므로 200줄까지 허용. 다만 비즈니스 로직은 feature 훅에 위임해야 함
2. **`packages/ui/` 컴포넌트** — 공유 UI 라이브러리는 Radix 래핑/스타일링이 목적이므로 Headless UI 패턴 적용 대상이 아님. 자체적으로 단일 책임을 갖추면 충분
3. **단순 표현 컴포넌트의 hooks/ 부재** — 순수하게 props만 받아서 렌더링하는 컴포넌트(예: `AnalysisSkeleton`, `LoadingSpinner`)는 hooks/ 디렉토리가 불필요
4. **폼 컴포넌트의 useState** — 입력값 바인딩을 위한 `useState`는 UI 상태이므로 SRP 위반이 아님. 단, 제출/유효성 검사 로직은 훅으로 분리 권장
5. **이벤트 위임 패턴** — `onConfirm`, `onFileSelect` 등 콜백을 props로 받아 단순 호출하는 것은 비즈니스 로직이 아님 (로직은 호출자 측에 존재)
6. **위젯의 자체 애니메이션/인터랙션 상태** — `useState`로 아코디언 열림/닫힘, 호버 상태 등 순수 UI 인터랙션을 관리하는 것은 허용
