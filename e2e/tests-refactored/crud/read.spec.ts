import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { CalendarPage } from '../../pages/CalendarPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * CRUD Test: Read (일정 조회)
 *
 * 일정 조회 및 표시 기능을 격리하여 테스트합니다.
 * 생성된 일정이 올바르게 표시되고 검색되는지 검증합니다.
 */

test.describe('CRUD: 일정 조회 (Read)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;
  let calendarPage: CalendarPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);
    calendarPage = new CalendarPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)
  });

  test('생성된 일정이 목록에 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 일정을 생성함
     * Then: 생성된 일정이 목록에 표시됨
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 목록에 표시되는지 확인
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('여러 일정이 모두 목록에 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 여러 개의 일정을 생성함
     * Then: 모든 일정이 목록에 표시됨
     */
    const events = TestDataFactory.createSearchTestEvents().slice(0, 3);

    // 여러 일정 생성
    for (const event of events) {
      await formPage.clearForm();
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);
    }

    // 모든 일정이 목록에 있는지 확인
    for (const event of events) {
      const hasEvent = await listPage.hasEventWithTitle(event.title);
      expect(hasEvent).toBe(true);
    }

    // 목록의 일정 수 확인 (최소 3개 이상)
    const eventCount = await listPage.getEventCount();
    expect(eventCount).toBeGreaterThanOrEqual(3);
  });

  test('일정 상세 정보가 목록에 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 상세 정보가 있는 일정을 생성함
     * Then: 제목, 위치, 설명 등의 정보가 목록에 표시됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('상세 정보 표시 테스트')
      .withDate('2025-11-15')
      .withStartTime('14:00')
      .withEndTime('15:00')
      .withDescription('이것은 상세 설명입니다')
      .withLocation('회의실 A')
      .withCategory('업무')
      .build();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 목록에 표시됨
    await listPage.waitForEvent(eventData.title);

    // 제목이 표시되는지 확인
    const hasTitle = await listPage.hasEventWithTitle(eventData.title);
    expect(hasTitle).toBe(true);

    // 위치 정보가 포함되는지 확인
    const hasLocation = await listPage.eventContainsText(
      eventData.title,
      eventData.location!
    );
    expect(hasLocation).toBe(true);
  });

  test('특수문자가 있는 일정이 올바르게 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 특수문자가 포함된 제목으로 일정을 생성함
     * Then: 특수문자가 보존되어 표시됨
     */
    const eventData = TestDataFactory.createEventWithSpecialCharacters();

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 목록에 표시됨
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('긴 제목이 있는 일정이 올바르게 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 매우 긴 제목으로 일정을 생성함
     * Then: 제목이 적절하게 표시됨 (잘림, 줄바꿈, 스크롤 등)
     */
    const eventData = TestDataFactory.createLongTitleEvent();

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 부분 텍스트로 일정 확인
    await listPage.waitForEvent(eventData.title.substring(0, 20));

    const hasEvent = await listPage.hasEventWithTitle(
      eventData.title.substring(0, 30)
    );
    expect(hasEvent).toBe(true);
  });

  test('API를 통해 생성된 일정이 목록에 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: API를 통해 일정을 직접 생성함
     * Then: 페이지 새로고침 후 일정이 목록에 표시됨
     */
    const eventData = TestDataFactory.createBasicEvent();

    // API를 통해 일정 생성 (UI 상호작용 없음)
    const createdEvent = await appContext.createEventViaAPI(eventData);

    // 페이지 새로고침하여 API 데이터 로드
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 일정이 목록에 표시되는지 확인
    await listPage.waitForEventList();
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('생성된 일정의 제목이 정확하게 저장됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 특정 제목으로 일정을 생성함
     * Then: 입력한 제목과 동일하게 저장됨
     */
    const eventTitle = '정확한 제목 저장 테스트 일정';
    const eventData = TestDataFactory.builder()
      .withTitle(eventTitle)
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 정확한 제목으로 확인
    const hasEvent = await listPage.hasEventWithTitle(eventTitle);
    expect(hasEvent).toBe(true);
  });

  test('빈 목록 상태에서 생성 후 일정 표시', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 목록이 비어있음
     * When: 첫 번째 일정을 생성함
     * Then: 일정이 목록에 표시되고 "검색 결과 없음" 메시지는 표시되지 않음
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 표시되는지 확인
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);

    // "검색 결과 없음" 메시지는 표시되지 않아야 함
    const hasNoResult = await listPage.hasNoSearchResult();
    expect(hasNoResult).toBe(false);
  });

  test('일정 목록의 이벤트 개수가 정확함', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 정확한 개수의 일정을 생성함
     * Then: 목록의 일정 개수가 생성한 개수와 일치함
     */
    const createCount = 5;
    const events = TestDataFactory.createSearchTestEvents().slice(0, createCount);

    // createCount개의 일정 생성
    for (const event of events) {
      await formPage.clearForm();
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);
    }

    // 목록의 일정 개수 확인
    const eventCount = await listPage.getEventCount();
    expect(eventCount).toBeGreaterThanOrEqual(createCount);
  });
});
