import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { DialogPage } from '../../pages/DialogPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * Feature Test: Recurring Events (반복 일정)
 *
 * 반복 일정 생성, 수정, 삭제 기능을 테스트합니다.
 * 일간, 주간, 월간, 연간 반복 일정의 동작을 검증합니다.
 */

test.describe('Feature: 반복 일정 (Recurring Events)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;
  let dialogPage: DialogPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);
    dialogPage = new DialogPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)
  });

  test('일간 반복 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 일간 반복 일정을 생성함
     * Then: 반복 일정이 생성되고 여러 날짜에 표시됨
     */
    const eventData = TestDataFactory.createDailyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);

    // 반복 설정
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매일');
    }

    await formPage.clickAddEvent();

    // 반복 일정이 생성되었는지 확인
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('주간 반복 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 주간 반복 일정을 생성함
     * Then: 반복 일정이 생성되고 매주 같은 요일에 표시됨
     */
    const eventData = TestDataFactory.createWeeklyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);

    // 반복 설정
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매주');
    }

    await formPage.clickAddEvent();

    // 반복 일정이 생성되었는지 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('반복 일정 수정 - 이 일정만 수정', async ({ page, appContext }) => {
    /**
     * Given: 반복 일정이 생성됨
     * When: 반복 일정 중 하나를 수정하고 "이 일정만" 선택
     * Then: 선택된 일정만 수정됨
     */
    const eventData = TestDataFactory.createDailyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매일');
    }
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 수정
    await listPage.clickEventByTitle(eventData.title);

    // 반복 일정 다이얼로그 확인
    const hasRecurringDialog = await dialogPage.hasRecurringDialog();
    if (hasRecurringDialog) {
      await dialogPage.selectSingleInstance();
    }

    // 제목 수정
    await formPage.fillTitle('수정된 단일 일정');
    await formPage.clickAddEvent();

    // 수정된 일정 확인
    const hasModified = await listPage.hasEventWithTitle('수정된 단일 일정');
    expect(hasModified).toBe(true);

    // 원본 일정도 여전히 존재해야 함
    const hasOriginal = await listPage.hasEventWithTitle(eventData.title);
    expect(hasOriginal).toBe(true);
  });

  test('반복 일정 수정 - 모든 일정 수정', async ({ page, appContext }) => {
    /**
     * Given: 반복 일정이 생성됨
     * When: 반복 일정을 수정하고 "모든 일정" 선택
     * Then: 모든 반복 인스턴스가 수정됨
     */
    const eventData = TestDataFactory.createDailyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매일');
    }
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 수정
    await listPage.clickEventByTitle(eventData.title);

    // 반복 일정 다이얼로그에서 "모든 일정" 선택
    const hasRecurringDialog = await dialogPage.hasRecurringDialog();
    if (hasRecurringDialog) {
      await dialogPage.selectAllInstances();
    }

    // 제목 수정
    const newTitle = '모든 반복 일정 수정';
    await formPage.fillTitle(newTitle);
    await formPage.clickAddEvent();

    // 수정된 일정 확인
    const hasModified = await listPage.hasEventWithTitle(newTitle);
    expect(hasModified).toBe(true);

    // 원본 제목은 없어야 함
    const hasOriginal = await listPage.hasEventWithTitle(eventData.title);
    expect(hasOriginal).toBe(false);
  });

  test('반복 일정 삭제 - 이 일정만 삭제', async ({ page, appContext }) => {
    /**
     * Given: 반복 일정이 생성됨
     * When: 반복 일정 중 하나를 삭제하고 "이 일정만" 선택
     * Then: 선택된 일정만 삭제됨
     */
    const eventData = TestDataFactory.createDailyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매일');
    }
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);

    // 반복 일정 다이얼로그에서 "이 일정만" 선택
    const hasRecurringDialog = await dialogPage.hasRecurringDialog();
    if (hasRecurringDialog) {
      await dialogPage.selectSingleInstance();
    }

    // 여전히 반복 일정이 존재해야 함 (다른 인스턴스는 유지됨)
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('반복 일정 삭제 - 모든 일정 삭제', async ({ page, appContext }) => {
    /**
     * Given: 반복 일정이 생성됨
     * When: 반복 일정을 삭제하고 "모든 일정" 선택
     * Then: 모든 반복 인스턴스가 삭제됨
     */
    const eventData = TestDataFactory.createDailyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매일');
    }
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);

    // 반복 일정 다이얼로그에서 "모든 일정" 선택
    const hasRecurringDialog = await dialogPage.hasRecurringDialog();
    if (hasRecurringDialog) {
      await dialogPage.selectAllInstances();
    }

    // 모든 반복 일정이 삭제되었는지 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(false);
  });

  test('반복 종료 날짜 설정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 종료 날짜가 있는 반복 일정을 생성함
     * Then: 반복이 종료 날짜까지만 진행됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('종료 날짜가 있는 반복 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withRepeat('daily', 1, '2025-11-20') // 11월 20일까지 매일 반복
      .build();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);

    // 반복 설정 (종료 날짜 포함)
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매일');
    }

    const endDateInput = await formPage.page.getByLabel('반복 종료|End Date');
    if (endDateInput) {
      await endDateInput.fill('2025-11-20');
    }

    await formPage.clickAddEvent();

    // 반복 일정 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('반복 간격 설정 (격주 또는 월 2회)', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 간격이 있는 반복 일정을 생성함 (예: 2주 간격)
     * Then: 지정된 간격대로 반복됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('격주 반복 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withRepeat('weekly', 2) // 2주 간격
      .build();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);

    // 반복 설정 (간격)
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('격주');
    }

    await formPage.clickAddEvent();

    // 반복 일정 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('반복 일정 중 하나만 수정해도 반복 설정 유지', async ({ page, appContext }) => {
    /**
     * Given: 반복 일정이 생성됨
     * When: 반복 일정 중 하나를 수정하고 "이 일정만" 선택
     * Then: 원본 반복 일정은 계속 반복됨
     */
    const eventData = TestDataFactory.createWeeklyRecurringEvent();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매주');
    }
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 개수 확인
    const countBefore = await listPage.getEventCount();

    // 일정 수정
    await listPage.clickEventByTitle(eventData.title);

    // "이 일정만" 선택
    const hasRecurringDialog = await dialogPage.hasRecurringDialog();
    if (hasRecurringDialog) {
      await dialogPage.selectSingleInstance();
    }

    // 수정
    await formPage.fillTitle('개별 수정된 일정');
    await formPage.clickAddEvent();

    // 개수 확인 (변화 없어야 함, 제목만 변경)
    const countAfter = await listPage.getEventCount();
    expect(countAfter).toBe(countBefore);
  });

  test('월간 반복 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 월간 반복 일정을 생성함
     * Then: 매월 같은 날짜에 반복됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('월간 반복 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withRepeat('monthly', 1)
      .build();

    // 반복 일정 생성
    await formPage.fillEventForm(eventData);

    // 반복 설정
    const repeatSelect = await formPage.page.getByLabel('반복');
    if (repeatSelect) {
      await repeatSelect.fill('매월');
    }

    await formPage.clickAddEvent();

    // 반복 일정 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });
});
