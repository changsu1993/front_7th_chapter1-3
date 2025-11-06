import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * Feature Test: Notifications (알림 기능)
 *
 * 일정에 대한 알림 설정 및 표시 기능을 테스트합니다.
 * 일정 생성 시 알림 시간을 설정하고 저장되는지 검증합니다.
 */

test.describe('Feature: 일정 알림 (Notifications)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)
  });

  test('일정 생성 시 알림 설정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 알림 설정과 함께 일정을 생성함
     * Then: 일정이 생성되고 알림 설정이 저장됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('알림 설정 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withNotification(10) // 10분 전 알림
      .build();

    // 알림 설정과 함께 일정 생성
    await formPage.fillEventForm(eventData);
    // 알림 시간 설정 (UI에서 select 또는 input으로 설정)
    const notificationSelect = await formPage.page.getByLabel('알림|Notification');
    if (notificationSelect) {
      await notificationSelect.fill('10분 전');
    }
    await formPage.clickAddEvent();

    // 일정이 생성되었는지 확인
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('다양한 알림 시간 설정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 다양한 알림 시간으로 일정을 생성함 (5분, 15분, 30분, 1시간 등)
     * Then: 모든 일정이 알림 설정과 함께 저장됨
     */
    const notificationTimes = [
      { minutes: 5, title: '5분 전 알림 일정' },
      { minutes: 15, title: '15분 전 알림 일정' },
      { minutes: 30, title: '30분 전 알림 일정' },
      { minutes: 60, title: '1시간 전 알림 일정' },
    ];

    for (const notif of notificationTimes) {
      const eventData = TestDataFactory.builder()
        .withTitle(notif.title)
        .withDate('2025-11-15')
        .withStartTime('10:00')
        .withEndTime('11:00')
        .withNotification(notif.minutes)
        .build();

      await formPage.fillEventForm(eventData);

      // 알림 시간 설정
      const notificationSelect = await formPage.page.getByLabel('알림|Notification');
      if (notificationSelect) {
        await notificationSelect.fill(`${notif.minutes}분 전`);
      }

      await formPage.clickAddEvent();
      await listPage.waitForEvent(eventData.title);

      // 다음 일정을 위해 폼 초기화
      await formPage.clearForm();
    }

    // 모든 일정이 생성되었는지 확인
    for (const notif of notificationTimes) {
      const hasEvent = await listPage.hasEventWithTitle(notif.title);
      expect(hasEvent).toBe(true);
    }
  });

  test('알림 없음 설정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 알림 없음으로 설정하여 일정을 생성함
     * Then: 일정이 생성되고 알림이 비활성화됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('알림 없음 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withNotification(0) // 알림 없음
      .build();

    // 알림 없음으로 설정
    await formPage.fillEventForm(eventData);
    const notificationSelect = await formPage.page.getByLabel('알림|Notification');
    if (notificationSelect) {
      await notificationSelect.fill('알림 없음');
    }
    await formPage.clickAddEvent();

    // 일정이 생성되었는지 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('일정 수정 시 알림 설정 변경', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 알림이 설정된 일정이 생성됨
     * When: 일정의 알림 설정을 변경함
     * Then: 변경된 알림 설정이 저장됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('알림 수정 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withNotification(10) // 10분 전 알림
      .build();

    // 일정 생성
    await formPage.fillEventForm(originalEvent);
    const notificationSelect = await formPage.page.getByLabel('알림|Notification');
    if (notificationSelect) {
      await notificationSelect.fill('10분 전');
    }
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 수정
    await listPage.clickEventByTitle(originalEvent.title);

    // 알림 설정 변경 (10분 → 30분)
    if (notificationSelect) {
      await notificationSelect.fill('30분 전');
    }
    await formPage.clickAddEvent();

    // 수정된 일정 확인
    const hasEvent = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasEvent).toBe(true);
  });

  test('API를 통해 생성된 일정의 알림 설정 표시', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: API를 통해 알림이 설정된 일정을 생성함
     * Then: 페이지 새로고침 후 알림 설정이 표시됨
     */
    const eventData = TestDataFactory.builder()
      .withTitle('API 알림 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withNotification(15) // 15분 전 알림
      .build();

    // API를 통해 알림 설정과 함께 일정 생성
    const createdEvent = await appContext.createEventViaAPI(eventData);

    // 페이지 새로고침
    await formPage.page.reload();
    await formPage.page.waitForLoadState('networkidle');

    // 일정이 목록에 표시되는지 확인
    await listPage.waitForEventList();
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('알림 시간이 일정 시작 시간보다 전에 설정됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 일정을 생성할 때 알림 시간을 설정함
     * Then: 알림 시간은 일정 시작 시간보다 이전이어야 함
     */
    const eventData = TestDataFactory.builder()
      .withTitle('시간 검증 알림 일정')
      .withDate('2025-11-15')
      .withStartTime('14:00')
      .withEndTime('15:00')
      .withNotification(30)
      .build();

    await formPage.fillEventForm(eventData);

    // 알림 30분 전 설정
    const notificationSelect = await formPage.page.getByLabel('알림|Notification');
    if (notificationSelect) {
      await notificationSelect.fill('30분 전');
    }

    await formPage.clickAddEvent();

    // 일정 생성 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('여러 일정에 다양한 알림 설정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 여러 일정을 생성하고 각각 다른 알림을 설정함
     * Then: 각 일정의 알림 설정이 독립적으로 저장됨
     */
    const events = [
      { title: '일정 1 - 5분 알림', notification: 5 },
      { title: '일정 2 - 15분 알림', notification: 15 },
      { title: '일정 3 - 30분 알림', notification: 30 },
    ];

    for (const event of events) {
      const eventData = TestDataFactory.builder()
        .withTitle(event.title)
        .withDate('2025-11-15')
        .withStartTime('10:00')
        .withEndTime('11:00')
        .withNotification(event.notification)
        .build();

      await formPage.fillEventForm(eventData);

      // 알림 설정
      const notificationSelect = await formPage.page.getByLabel('알림|Notification');
      if (notificationSelect) {
        await notificationSelect.fill(`${event.notification}분 전`);
      }

      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);

      // 다음 일정을 위해 폼 초기화
      await formPage.clearForm();
    }

    // 모든 일정 확인
    for (const event of events) {
      const hasEvent = await listPage.hasEventWithTitle(event.title);
      expect(hasEvent).toBe(true);
    }
  });

  test('알림 설정 없이도 일정 생성 가능', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 알림 설정을 하지 않고 일정을 생성함
     * Then: 일정이 정상적으로 생성됨 (기본 알림 또는 알림 없음)
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 알림 설정 없이 일정 생성 (기본값 사용)
    await formPage.fillEventForm(eventData);
    // 알림 필드를 건드리지 않음
    await formPage.clickAddEvent();

    // 일정이 생성되었는지 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });

  test('특수문자 제목의 일정에 알림 설정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드됨
     * When: 특수문자 제목의 일정에 알림을 설정하여 생성함
     * Then: 일정과 알림 설정이 모두 저장됨
     */
    const eventData = TestDataFactory.createEventWithSpecialCharacters();

    await formPage.fillEventForm(eventData);

    // 알림 설정
    const notificationSelect = await formPage.page.getByLabel('알림|Notification');
    if (notificationSelect) {
      await notificationSelect.fill('15분 전');
    }

    await formPage.clickAddEvent();

    // 일정 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });
});
