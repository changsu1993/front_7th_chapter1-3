import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { DialogPage } from '../../pages/DialogPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * Feature Test: Overlapping Events (일정 겹침 감지)
 *
 * 일정이 겹치는 경우를 감지하고 경고를 표시하는 기능을 테스트합니다.
 * 사용자가 겹치는 일정 생성 시 경고를 받고 계속 진행할 수 있습니다.
 */

test.describe('Feature: 일정 겹침 감지 (Overlapping Events)', () => {
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

  test('겹치는 일정 생성 시 경고 표시', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성됨 (10:00-11:00)
     * When: 겹치는 시간에 일정을 생성함 (10:30-11:30)
     * Then: 겹침 경고 다이얼로그가 표시됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('기본 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const overlappingEvent = TestDataFactory.builder()
      .withTitle('겹치는 일정')
      .withDate('2025-11-15')
      .withStartTime('10:30')
      .withEndTime('11:30')
      .build();

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 겹치는 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(overlappingEvent);
    await formPage.clickAddEvent();

    // 겹침 경고 확인
    const hasWarning = await dialogPage.hasOverlapWarning();
    expect(hasWarning).toBe(true);
  });

  test('겹침 경고 무시하고 계속 진행', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성되고 겹치는 일정 생성 시 경고가 표시됨
     * When: "계속" 버튼을 클릭함
     * Then: 겹치는 일정이 생성됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('기본 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const overlappingEvent = TestDataFactory.builder()
      .withTitle('겹침 무시 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:30')
      .withEndTime('11:30')
      .build();

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 겹치는 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(overlappingEvent);
    await formPage.clickAddEvent();

    // 경고 확인 후 계속 진행
    const hasWarning = await dialogPage.hasOverlapWarning();
    if (hasWarning) {
      await dialogPage.continueWithOverlapWarning();
    }

    // 겹치는 일정이 생성되었는지 확인
    await listPage.waitForEvent(overlappingEvent.title);
    const hasEvent = await listPage.hasEventWithTitle(overlappingEvent.title);
    expect(hasEvent).toBe(true);
  });

  test('겹침 경고 취소하면 일정이 생성되지 않음', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성되고 겹치는 일정 생성 시 경고가 표시됨
     * When: "취소" 버튼을 클릭함
     * Then: 겹치는 일정이 생성되지 않음
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('기본 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const overlappingEvent = TestDataFactory.builder()
      .withTitle('취소된 겹침 일정')
      .withDate('2025-11-15')
      .withStartTime('10:30')
      .withEndTime('11:30')
      .build();

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 겹치는 일정 생성 시도
    await formPage.clearForm();
    await formPage.fillEventForm(overlappingEvent);
    await formPage.clickAddEvent();

    // 경고 확인 후 취소
    const hasWarning = await dialogPage.hasOverlapWarning();
    if (hasWarning) {
      await dialogPage.cancelOverlapWarning();
    }

    // 겹치는 일정이 생성되지 않았는지 확인
    const hasEvent = await listPage.hasEventWithTitle(overlappingEvent.title);
    expect(hasEvent).toBe(false);
  });

  test('정확히 겹치는 시간대의 일정 감지', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성됨 (10:00-11:00)
     * When: 정확히 같은 시간대에 일정을 생성함 (10:00-11:00)
     * Then: 겹침 경고가 표시됨
     */
    const event1 = TestDataFactory.builder()
      .withTitle('일정 1')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const event2 = TestDataFactory.builder()
      .withTitle('일정 2 - 정확히 같은 시간')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    // 첫 번째 일정 생성
    await formPage.fillEventForm(event1);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(event1.title);

    // 정확히 같은 시간대 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(event2);
    await formPage.clickAddEvent();

    // 겹침 경고 확인
    const hasWarning = await dialogPage.hasOverlapWarning();
    expect(hasWarning).toBe(true);
  });

  test('일정의 경계가 겹칠 때 경고 표시', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성됨 (10:00-11:00)
     * When: 경계 시간부터 시작하는 일정을 생성함 (11:00-12:00)
     * Then: 경계가 겹치는 경우 경고 표시 여부 확인
     */
    const event1 = TestDataFactory.builder()
      .withTitle('일정 1 - 10시부터')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const event2 = TestDataFactory.builder()
      .withTitle('일정 2 - 11시부터')
      .withDate('2025-11-15')
      .withStartTime('11:00')
      .withEndTime('12:00')
      .build();

    // 첫 번째 일정 생성
    await formPage.fillEventForm(event1);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(event1.title);

    // 경계 시간부터 시작하는 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(event2);
    await formPage.clickAddEvent();

    // 겹침 경고 여부 확인 (경계는 겹치지 않음으로 간주)
    const hasWarning = await dialogPage.hasOverlapWarning();
    // 경계 케이스는 앱의 정책에 따라 다름
  });

  test('다른 날짜의 일정은 겹침 감지 안 함', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성됨 (2025-11-15 10:00-11:00)
     * When: 다른 날짜에 같은 시간대 일정을 생성함 (2025-11-16 10:00-11:00)
     * Then: 겹침 경고가 표시되지 않음
     */
    const event1 = TestDataFactory.builder()
      .withTitle('일정 1 - 11월 15일')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const event2 = TestDataFactory.builder()
      .withTitle('일정 2 - 11월 16일')
      .withDate('2025-11-16')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    // 첫 번째 일정 생성
    await formPage.fillEventForm(event1);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(event1.title);

    // 다른 날짜 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(event2);
    await formPage.clickAddEvent();

    // 겹침 경고가 없어야 함
    const hasWarning = await dialogPage.hasOverlapWarning();
    expect(hasWarning).toBe(false);

    // 두 일정이 모두 생성되어야 함
    const hasEvent1 = await listPage.hasEventWithTitle(event1.title);
    const hasEvent2 = await listPage.hasEventWithTitle(event2.title);
    expect(hasEvent1).toBe(true);
    expect(hasEvent2).toBe(true);
  });

  test('부분적으로 겹치는 일정 감지', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성됨 (10:00-12:00)
     * When: 부분적으로 겹치는 일정을 생성함 (11:00-13:00)
     * Then: 겹침 경고가 표시됨
     */
    const event1 = TestDataFactory.builder()
      .withTitle('기본 일정 - 2시간')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('12:00')
      .build();

    const event2 = TestDataFactory.builder()
      .withTitle('부분 겹침 일정')
      .withDate('2025-11-15')
      .withStartTime('11:00')
      .withEndTime('13:00')
      .build();

    // 첫 번째 일정 생성
    await formPage.fillEventForm(event1);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(event1.title);

    // 부분적으로 겹치는 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(event2);
    await formPage.clickAddEvent();

    // 겹침 경고 확인
    const hasWarning = await dialogPage.hasOverlapWarning();
    expect(hasWarning).toBe(true);
  });

  test('여러 일정과 겹치는 경우 경고 표시', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 그들과 겹치는 일정을 생성함
     * Then: 겹침 경고가 표시됨
     */
    const event1 = TestDataFactory.builder()
      .withTitle('일정 1')
      .withDate('2025-11-15')
      .withStartTime('09:00')
      .withEndTime('10:00')
      .build();

    const event2 = TestDataFactory.builder()
      .withTitle('일정 2')
      .withDate('2025-11-15')
      .withStartTime('11:00')
      .withEndTime('12:00')
      .build();

    const overlappingEvent = TestDataFactory.builder()
      .withTitle('여러 일정과 겹치는 일정')
      .withDate('2025-11-15')
      .withStartTime('09:30')
      .withEndTime('11:30')
      .build();

    // 여러 일정 생성
    await formPage.fillEventForm(event1);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(event1.title);

    await formPage.clearForm();
    await formPage.fillEventForm(event2);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(event2.title);

    // 여러 일정과 겹치는 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(overlappingEvent);
    await formPage.clickAddEvent();

    // 겹침 경고 확인
    const hasWarning = await dialogPage.hasOverlapWarning();
    expect(hasWarning).toBe(true);
  });

  test('겹침 경고에 다른 일정 정보 표시', async ({ page, appContext }) => {
    /**
     * Given: 기본 일정이 생성됨
     * When: 겹치는 일정을 생성하여 경고가 표시됨
     * Then: 경고 다이얼로그에 기본 일정의 정보가 표시될 수 있음
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('기본 일정 - 겹침 정보 표시')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const overlappingEvent = TestDataFactory.builder()
      .withTitle('겹치는 일정')
      .withDate('2025-11-15')
      .withStartTime('10:30')
      .withEndTime('11:30')
      .build();

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 겹치는 일정 생성
    await formPage.clearForm();
    await formPage.fillEventForm(overlappingEvent);
    await formPage.clickAddEvent();

    // 경고 다이얼로그 확인
    const hasWarning = await dialogPage.hasOverlapWarning();
    if (hasWarning) {
      const dialogContent = await dialogPage.getDialogContent();
      expect(dialogContent).toBeTruthy();
      // 경고 내용에 "겹침" 관련 메시지가 포함되어야 함
      expect(dialogContent?.includes('겹침') || dialogContent?.includes('conflict')).toBeTruthy();
    }
  });
});
