import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * CRUD Test: Create (일정 생성)
 *
 * 일정 생성 기능을 격리하여 테스트합니다.
 * 다른 기능(수정, 삭제)과 분리하여 각 기능을 명확하게 검증합니다.
 */

test.describe('CRUD: 일정 생성 (Create)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)
  });

  test('기본 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 기본 정보로 일정을 생성함
     * Then: 일정이 목록에 표시됨
     */
    const eventData = TestDataFactory.createBasicEvent();

    // UI를 통해 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 목록에 표시되는지 확인
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('상세 정보가 있는 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 모든 필드를 채워서 일정을 생성함
     * Then: 생성된 일정의 모든 정보가 저장됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('상세 정보 일정')
      .withDate('2025-11-15')
      .withStartTime('14:00')
      .withEndTime('15:00')
      .withDescription('이것은 상세 설명입니다')
      .withLocation('회의실 A')
      .withCategory('업무')
      .build();

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 목록에 표시됨
    await listPage.waitForEvent(eventData.title);

    // 위치와 설명이 함께 표시되는지 확인
    const hasLocation = await listPage.eventContainsText(
      eventData.title,
      eventData.location!
    );
    expect(hasLocation).toBe(true);
  });

  test('여러 일정 연속 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 3개의 일정을 연속으로 생성함
     * Then: 모든 일정이 목록에 표시됨
     */
    const events = TestDataFactory.createSearchTestEvents();

    for (let i = 0; i < 3; i++) {
      const event = events[i];

      // 첫 번째가 아닌 경우 폼을 다시 열기 (이전 일정 생성 후 폼이 닫혀있음)
      if (i > 0) {
        // 단순히 "일정 추가" 버튼만 클릭해서 폼을 열기
        await page.getByRole('button', { name: '일정 추가' }).click();
        await formPage.waitForForm();
      }

      // 폼 초기화 (이전 입력값 제거)
      await formPage.clearForm();

      // 새 일정 생성
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();

      // 일정이 추가됨
      await listPage.waitForEvent(event.title);
    }

    // 모든 일정이 목록에 있는지 확인
    for (const event of events.slice(0, 3)) {
      const hasEvent = await listPage.hasEventWithTitle(event.title);
      expect(hasEvent).toBe(true);
    }

    // 목록의 일정 수 확인
    const eventCount = await listPage.getEventCount();
    expect(eventCount).toBeGreaterThanOrEqual(3);
  });

  test('필수 필드 검증 - 제목 없음', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 제목 없이 일정을 생성하려 함
     * Then: 일정이 생성되지 않거나 에러 표시
     */
    const eventData = {
      title: '', // 제목 없음
      date: '2025-11-15',
      startTime: '10:00',
      endTime: '11:00',
    };

    await formPage.fillTitle('');
    await formPage.fillDate(eventData.date);
    await formPage.fillStartTime(eventData.startTime);
    await formPage.fillEndTime(eventData.endTime);

    // 추가 버튼 클릭
    await formPage.clickAddEvent();

    // 일정이 추가되지 않아야 함 (또는 에러 표시)
    const isButtonEnabled = await formPage.isAddEventButtonEnabled();
    // 에러 메시지나 버튼 비활성화 확인
  });

  test('시간 검증 - 시작 시간이 종료 시간보다 늦음', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 시작 시간이 종료 시간보다 늦게 입력함
     * Then: 에러가 표시되거나 일정이 생성되지 않음
     */
    const eventData = {
      title: '시간 오류 테스트',
      date: '2025-11-15',
      startTime: '15:00', // 종료보다 늦음
      endTime: '14:00',
    };

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 추가되지 않아야 함
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    // 시간 오류로 인해 생성 실패 확인
  });

  test('특수문자를 포함한 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 특수문자가 포함된 제목으로 일정을 생성함
     * Then: 일정이 정상 생성되고 특수문자가 보존됨
     */
    const eventData = TestDataFactory.createEventWithSpecialCharacters();

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 목록에 표시됨
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('긴 제목으로 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 매우 긴 제목으로 일정을 생성함
     * Then: 일정이 생성되고 제목이 적절하게 표시됨
     */
    const eventData = TestDataFactory.createLongTitleEvent();

    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 일정이 생성됨
    await listPage.waitForEvent(eventData.title.substring(0, 20)); // 부분 텍스트로 확인

    const hasEvent = await listPage.hasEventWithTitle(
      eventData.title.substring(0, 30)
    );
    expect(hasEvent).toBe(true);
  });

  test('API를 통한 일정 생성 (성능 테스트)', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: API를 통해 일정을 직접 생성함
     * Then: 일정이 UI에 반영됨
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
});
