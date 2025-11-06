# E2E 테스트 가이드

## 개요

이 프로젝트의 E2E 테스트는 **완전히 재설계된 아키텍처**를 사용합니다:

- ✅ **Page Object Model (POM)** - 선택자 중앙화
- ✅ **Fixture 패턴** - 자동 setup/teardown
- ✅ **Builder 패턴** - 유연한 테스트 데이터
- ✅ **고급 대기 전략** - 플래키 테스트 감소
- ✅ **재시도 로직** - 자동 재시도
- ✅ **병렬 실행** - 4개 워커로 빠른 실행

## 디렉토리 구조

```
e2e/
├── fixtures/               # Playwright 픽스처
│   └── app.fixture.ts     # AppTestContext 통합
├── pages/                  # Page Object Model
│   ├── BasePage.ts        # 기본 메서드들
│   ├── EventFormPage.ts   # 폼 상호작용
│   ├── EventListPage.ts   # 목록 표시
│   ├── DialogPage.ts      # 다이얼로그
│   └── CalendarPage.ts    # 캘린더
├── helpers/               # 유틸리티 클래스
│   ├── AppTestContext.ts  # 앱 초기화/정리
│   ├── TestDataFactory.ts # 테스트 데이터
│   ├── ClockProvider.ts   # 시간 Mock
│   └── RetryHandler.ts    # 재시도 로직
├── config/                # 설정
│   └── stability.config.ts # 안정성 설정
├── tests-refactored/      # 새로운 테스트들
│   ├── crud/              # CRUD 테스트
│   │   ├── create.spec.ts
│   │   ├── read.spec.ts
│   │   ├── update.spec.ts
│   │   └── delete.spec.ts
│   └── features/          # 기능 테스트
│       ├── overlapping.spec.ts
│       ├── notifications.spec.ts
│       ├── recurring.spec.ts
│       └── search.spec.ts
└── E2E_TESTING_GUIDE.md   # 이 파일
```

## 테스트 실행

### 기본 실행

```bash
# 모든 테스트 실행
pnpm test:e2e

# 특정 파일만 실행
pnpm test:e2e crud/create.spec.ts

# 특정 테스트만 실행 (정규표현식)
pnpm test:e2e -g "기본 일정 생성"
```

### 개발 모드

```bash
# 헤드드 모드 (브라우저 UI 표시)
HEADED=1 pnpm test:e2e

# 디버그 모드
DEBUG=1 pnpm test:e2e

# 서버 재사용 (빠른 실행)
pnpm test:e2e
```

### 병렬 실행

```bash
# 기본: 4개 워커
pnpm test:e2e

# 커스텀 워커 수
WORKERS=2 pnpm test:e2e

# 순차 실행 (문제 디버깅)
WORKERS=1 pnpm test:e2e
```

### 특수 모드

```bash
# 느린 네트워크 시뮬레이션
SLOW_NETWORK=1 pnpm test:e2e

# 스냅샷 업데이트
UPDATE_SNAPSHOTS=1 pnpm test:e2e

# 시각 회귀 테스트
pnpm test:e2e visual/
```

### UI 모드 (권장)

```bash
# Playwright의 인터랙티브 UI 사용
pnpm exec playwright test --ui
```

## 테스트 작성 가이드

### 기본 구조

```typescript
import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

test.describe('Feature: 기능명', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;

  test.beforeEach(async ({ page, appContext }) => {
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);
    // appContext는 자동으로 초기화됨
  });

  test('테스트 이름', async ({ page, appContext }) => {
    // Given: 초기 상태
    const eventData = TestDataFactory.createBasicEvent();

    // When: 작업 수행
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // Then: 결과 검증
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });
});
```

### Page Object 사용

```typescript
// ✅ Good: 캡슐화된 메서드 사용
await formPage.fillEventForm(eventData);

// ❌ Bad: raw selector 사용
await page.getByLabel('제목').fill(eventData.title);
```

### 테스트 데이터 생성

```typescript
// ✅ Factory 메서드 사용
const event = TestDataFactory.createBasicEvent();

// ✅ Builder 패턴으로 커스터마이징
const event = TestDataFactory.builder()
  .withTitle('커스텀 제목')
  .withDate('2025-11-15')
  .withNotification(15)
  .build();

// ❌ 하드코딩 (재사용성 낮음)
const event = {
  title: '일정',
  date: '2025-11-15',
  startTime: '10:00',
  endTime: '11:00'
};
```

### 대기 전략

```typescript
// ✅ 조건 기반 대기
await listPage.waitForEvent(eventData.title); // 요소가 보일 때까지

// ✅ 안정화 대기
await formPage.waitForTextAndStability('저장됨');

// ✅ 동작 대기
await basePage.waitForLoadingToComplete();

// ❌ 고정 시간 대기 (비효율적)
await page.waitForTimeout(5000);
```

### 재시도 로직

```typescript
import { retry, retryWaitFor } from '../../helpers/RetryHandler';

// ✅ 자동 재시도
await retry(
  async () => await formPage.clickAddEvent(),
  3 // 최대 3회
);

// ✅ 조건 대기
await retryWaitFor(
  () => listPage.hasEventWithTitle(eventData.title),
  5 // 최대 5회
);
```

## 고급 기능

### 동적 대기

BasePage의 고급 대기 메서드들:

```typescript
// 요소가 클릭 가능할 때까지 대기
await basePage.waitForClickable(locator);

// 네트워크 요청 완료
await basePage.waitForNetworkIdle();

// CSS 속성 변경 감지
await basePage.waitForCssChange(locator, 'opacity', '1');

// 조건 폴링
await basePage.waitUntil(() => someCondition(), {
  timeout: 5000,
  interval: 100
});
```

### 재시도 통계

```typescript
import { globalRetryHandler } from '../../helpers/RetryHandler';

// 테스트 후 통계 출력
globalRetryHandler.printStats();

// 개별 통계 조회
const stats = globalRetryHandler.getStats('operation-name');
```

### AppTestContext 기능

```typescript
// UI를 통한 이벤트 생성
await appContext.createEventViaUI(eventData);

// API를 통한 이벤트 생성 (빠름)
const createdEvent = await appContext.createEventViaAPI(eventData);

// 모든 상태 초기화
await appContext.cleanup();
```

## 성능 최적화

### 병렬 실행

기본 설정: **4개 워커**로 병렬 실행

```typescript
// 테스트를 여러 파일로 분산 (자동 병렬화)
// ✅ create.spec.ts, read.spec.ts, update.spec.ts 동시 실행
```

### 빠른 데이터 생성

```typescript
// ✅ API를 사용한 빠른 생성 (UI 우회)
await appContext.createEventViaAPI(eventData);

// UI 방식은 필요할 때만
await appContext.createEventViaUI(eventData);
```

### 선택적 스크린샷/비디오

```typescript
// 개발: 실패 시에만 (기본)
screenshot: 'only-on-failure'

// CI: 실패 시 비디오
video: process.env.CI ? 'retain-on-failure' : 'off'
```

## 문제 해결

### 플래키 테스트

**증상**: 가끔 실패하고 가끔 성공

**해결**:
1. 고정 타임아웃 제거 → 동적 대기로 변경
2. `waitUntil()` 또는 `waitForStability()` 사용
3. 재시도 로직 추가

```typescript
// ❌ 플래키
await page.waitForTimeout(2000);
const hasEvent = await listPage.hasEventWithTitle(title);

// ✅ 안정적
await listPage.waitForEvent(title);
```

### 타임아웃 문제

**증상**: "Timeout waiting for..."

**해결**:

```typescript
// 1. 더 긴 타임아웃 설정
await listPage.waitForEvent(title, 10000); // 10초

// 2. 선택자 검증
// waitFor 전에 요소가 존재하는지 확인

// 3. 네트워크 문제 확인
// console에서 네트워크 요청 상태 확인
```

### 병렬 실행 문제

**증상**: 병렬 실행 시에만 실패

**해결**:
1. 테스트 격리 확인 (beforeEach에서 초기화)
2. 공유 상태 제거
3. 순차 실행으로 확인: `WORKERS=1 pnpm test:e2e`

## CI/CD 통합

### GitHub Actions 예시

```yaml
- name: Run E2E Tests
  run: |
    CI=1 WORKERS=2 pnpm test:e2e

- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: playwright-report
    path: playwright-report/
```

## 모범 사례

### ✅ 해야 할 것

- Page Object 메서드 사용
- TestDataFactory로 데이터 생성
- Given-When-Then 구조로 작성
- 명확한 테스트 이름
- 에러 메시지 작성
- 병렬 실행 고려

### ❌ 하지 말아야 할 것

- raw selector 사용 (page.getByLabel 등)
- 테스트 간 의존성 생성
- 고정 타임아웃
- 하드코딩된 테스트 데이터
- 과도한 스크린샷

## 유용한 명령어

```bash
# 코드에 .only 사용 시 경고
pnpm test:e2e

# 마지막 실패한 테스트만 재실행
pnpm exec playwright test --last-failed

# 특정 프로젝트에서만 실행
pnpm exec playwright test --project=chromium

# 리포트 서버 실행
pnpm exec playwright show-report

# 트레이스 뷰어 실행
pnpm exec playwright show-trace trace.zip
```

## 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 질문?

이 가이드에서 찾을 수 없는 내용이 있으면:
1. 코드 주석 확인
2. 기존 테스트 참고
3. Playwright 공식 문서 참조
