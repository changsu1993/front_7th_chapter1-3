# E2E 및 시각적 회귀 테스트 문서

## 개요

이 프로젝트는 Playwright를 사용한 E2E 테스트와 시각적 회귀 테스트를 포함합니다.
총 10개의 테스트 파일(E2E 5개, 시각적 회귀 5개)이 구현되어 있습니다.

## 테스트 실행 방법

### 1. E2E 테스트 실행

```bash
# 모든 E2E 테스트 실행
pnpm test:e2e

# UI 모드로 실행 (디버깅에 유용)
pnpm test:e2e:ui

# 특정 테스트 파일만 실행
pnpm test:e2e e2e/basic-event-crud.spec.ts

# 헤드풀 모드로 실행 (브라우저 창 표시)
pnpm test:e2e --headed
```

### 2. 테스트 리포트 확인

```bash
# HTML 리포트 생성 및 열기
pnpm test:e2e:report
```

## E2E 테스트 목록

### 1. Basic Event CRUD Workflow (`basic-event-crud.spec.ts`)
- **목적**: 기본 일정 관리 CRUD 워크플로우 검증
- **커버리지**:
  - 일정 생성 (Create)
  - 일정 조회 (Read)
  - 일정 수정 (Update)
  - 일정 삭제 (Delete)
  - 여러 일정 생성
  - 필수 필드 검증
  - 시간 유효성 검증

### 2. Recurring Event Management (`recurring-event-management.spec.ts`)
- **목적**: 반복 일정 관리 워크플로우 검증
- **커버리지**:
  - 일간/주간/월간 반복 일정 생성
  - 단일 인스턴스 수정
  - 전체 반복 일정 수정
  - 단일 인스턴스 삭제
  - 전체 반복 일정 삭제
  - 다이얼로그 취소 동작

### 3. Event Overlap Handling (`event-overlap-handling.spec.ts`)
- **목적**: 일정 겹침 감지 및 처리 검증
- **커버리지**:
  - 겹치는 일정 생성 시 경고
  - 경고 무시하고 계속 진행
  - 경고 받고 취소
  - 부분 겹침 감지
  - 수정으로 인한 겹침
  - 여러 일정과 겹침
  - 겹치지 않는 인접 일정 (경고 없음)

### 4. Notification System (`notification-system.spec.ts`)
- **목적**: 알림 시스템 조건 및 동작 검증
- **커버리지**:
  - 알림 시간 설정 (1분, 10분, 1시간, 1일 전)
  - 알림 없음 설정
  - 알림 수정
  - 과거 시간 일정 알림 표시
  - 여러 동시 알림
  - 반복 일정 알림

### 5. Search and Filtering (`search-and-filtering.spec.ts`)
- **목적**: 검색 및 필터링 기능 검증
- **커버리지**:
  - 제목/설명/위치로 검색
  - 부분 문자열 검색
  - 대소문자 구분 없는 검색
  - 실시간 필터링
  - 검색어 삭제 시 전체 표시
  - 검색 결과 없음 처리
  - 특수문자/숫자 검색
  - 공백 처리
  - 연속 검색

## 시각적 회귀 테스트 목록

### 1. Calendar View Types (`visual-calendar-views.spec.ts`)
- **목적**: 캘린더 뷰 타입별 렌더링 검증
- **커버리지**:
  - 월간 뷰 기본 상태
  - 주간 뷰 기본 상태
  - 일정이 있는 월간/주간 뷰
  - 여러 일정이 있는 날
  - 네비게이션 (다음/이전)
  - 공휴일 표시
  - 빈 캘린더 상태

### 2. Event States (`visual-event-states.spec.ts`)
- **목적**: 일정 상태별 시각적 표현 검증
- **커버리지**:
  - 일반 일정
  - 알림 활성화 일정 (강조 표시)
  - 반복 일정 (아이콘)
  - 카테고리별 스타일
  - 선택된 일정 (편집 모드)
  - 드래그 가능 vs 불가능
  - 겹치는 일정
  - 복합 상태
  - 호버 상태

### 3. Dialogs and Modals (`visual-dialogs-modals.spec.ts`)
- **목적**: 다이얼로그 및 모달 시각적 검증
- **커버리지**:
  - 일정 겹침 경고 다이얼로그
  - 반복 일정 수정 다이얼로그
  - 반복 일정 삭제 다이얼로그
  - 성공 스낵바 (추가/수정/삭제)
  - 버튼 호버 상태
  - 여러 겹침 정보 표시
  - 애니메이션 비활성화

### 4. Form Control States (`visual-form-controls.spec.ts`)
- **목적**: 폼 컨트롤 상태별 시각적 검증
- **커버리지**:
  - 빈 폼 기본 상태
  - 포커스된 입력 필드
  - 채워진 폼
  - 시간 유효성 에러
  - 드롭다운 메뉴 (카테고리/반복/알림)
  - 편집 모드 (데이터 로드)
  - 반복 설정 활성화
  - 버튼 상태 (추가/수정/호버)
  - 포커스 순서
  - 긴 텍스트 입력

### 5. Text Overflow Handling (`visual-text-overflow.spec.ts`)
- **목적**: 텍스트 오버플로우 처리 검증
- **커버리지**:
  - 캘린더 셀의 긴 제목
  - 일정 리스트의 긴 제목
  - 긴 설명/위치
  - 여러 긴 일정이 한 셀에
  - 주간/월간 뷰 텍스트 처리
  - 특수문자와 이모지
  - 공백 없는 긴 단어
  - 숫자와 기호가 많은 텍스트
  - 다양한 길이 비교
  - 검색 결과 하이라이트

## 테스트 구조

```
e2e/
├── basic-event-crud.spec.ts              # E2E: CRUD 워크플로우
├── recurring-event-management.spec.ts     # E2E: 반복 일정
├── event-overlap-handling.spec.ts         # E2E: 일정 겹침
├── notification-system.spec.ts            # E2E: 알림 시스템
├── search-and-filtering.spec.ts           # E2E: 검색/필터링
├── visual-calendar-views.spec.ts          # Visual: 캘린더 뷰
├── visual-event-states.spec.ts            # Visual: 일정 상태
├── visual-dialogs-modals.spec.ts          # Visual: 다이얼로그
├── visual-form-controls.spec.ts           # Visual: 폼 컨트롤
└── visual-text-overflow.spec.ts           # Visual: 텍스트 오버플로우
```

## 시각적 회귀 테스트 초기 설정

시각적 회귀 테스트를 처음 실행할 때는 기준 스크린샷이 생성됩니다:

```bash
# 기준 스크린샷 생성 (첫 실행)
pnpm test:e2e

# 기준 스크린샷 업데이트 (의도적으로 UI가 변경된 경우)
pnpm test:e2e --update-snapshots
```

생성된 스크린샷은 `e2e/` 디렉토리 내에 저장됩니다.

## 주의사항

1. **서버 자동 실행**: Playwright 설정에서 `webServer` 옵션으로 dev 서버가 자동으로 실행됩니다.
2. **포트 충돌**: 3000번과 5173번 포트가 사용 중이 아닌지 확인하세요.
3. **스크린샷 차이**: 시각적 회귀 테스트는 OS/브라우저에 따라 차이가 있을 수 있습니다.
4. **테스트 격리**: 각 테스트는 독립적으로 실행되며 서로 영향을 주지 않습니다.

## 디버깅 팁

1. **브라우저 보기**:
   ```bash
   pnpm test:e2e --headed
   ```

2. **특정 테스트 실행**:
   ```bash
   pnpm test:e2e -g "일정 생성"
   ```

3. **디버그 모드**:
   ```bash
   pnpm test:e2e --debug
   ```

4. **Trace 확인**:
   테스트 실패 시 자동으로 trace가 저장됩니다. Playwright Inspector로 확인 가능합니다.

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
