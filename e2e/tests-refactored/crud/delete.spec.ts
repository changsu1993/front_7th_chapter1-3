import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * CRUD Test: Delete (일정 삭제)
 *
 * 일정 삭제 기능을 격리하여 테스트합니다.
 * 일정이 제대로 삭제되고 목록에서 제거되는지 검증합니다.
 */

test.describe('CRUD: 일정 삭제 (Delete)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)
  });

  test('생성된 일정을 삭제', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨
     * When: 일정을 삭제함
     * Then: 일정이 목록에서 제거됨
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);

    // 일정이 목록에서 제거되었는지 확인
    await listPage.waitForEventToDisappear(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(false);
  });

  test('여러 일정 중 하나를 삭제', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 여러 일정이 생성됨
     * When: 그 중 하나를 삭제함
     * Then: 삭제된 일정만 제거되고 나머지는 유지됨
     */
    const events = TestDataFactory.createSearchTestEvents().slice(0, 3);

    // 여러 일정 생성
    for (const event of events) {
      await formPage.clearForm();
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);
    }

    // 첫 번째 일정 삭제
    const eventToDelete = events[0];
    await listPage.deleteEventByTitle(eventToDelete.title);

    // 삭제된 일정 확인
    await listPage.waitForEventToDisappear(eventToDelete.title);
    const hasDeletedEvent = await listPage.hasEventWithTitle(eventToDelete.title);
    expect(hasDeletedEvent).toBe(false);

    // 다른 일정들은 여전히 존재해야 함
    for (let i = 1; i < events.length; i++) {
      const hasEvent = await listPage.hasEventWithTitle(events[i].title);
      expect(hasEvent).toBe(true);
    }
  });

  test('삭제 후 일정 개수가 감소함', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 여러 일정이 생성됨
     * When: 일정을 삭제함
     * Then: 목록의 일정 개수가 감소함
     */
    const events = TestDataFactory.createSearchTestEvents().slice(0, 3);

    // 여러 일정 생성
    for (const event of events) {
      await formPage.clearForm();
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);
    }

    // 삭제 전 개수 확인
    const countBefore = await listPage.getEventCount();

    // 첫 번째 일정 삭제
    await listPage.deleteEventByTitle(events[0].title);
    await listPage.waitForEventToDisappear(events[0].title);

    // 삭제 후 개수 확인
    const countAfter = await listPage.getEventCount();
    expect(countAfter).toBeLessThan(countBefore);
  });

  test('삭제된 일정은 페이지 새로고침 후에도 없음', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성되고 삭제됨
     * When: 페이지를 새로고침함
     * Then: 삭제된 일정이 여전히 없음
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);
    await listPage.waitForEventToDisappear(eventData.title);

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 삭제된 일정이 여전히 없는지 확인
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(false);
  });

  test('삭제된 일정의 제목으로 검색 결과 없음', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성되고 삭제됨
     * When: 삭제된 일정의 제목으로 검색함
     * Then: 검색 결과가 없음
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);
    await listPage.waitForEventToDisappear(eventData.title);

    // 삭제된 일정으로 검색
    await listPage.search(eventData.title);

    // 검색 결과 없음
    const hasSearchResult = await listPage.hasSearchResult(eventData.title);
    expect(hasSearchResult).toBe(false);
  });

  test('특수문자가 있는 일정 삭제', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 특수문자가 있는 일정이 생성됨
     * When: 해당 일정을 삭제함
     * Then: 일정이 올바르게 삭제됨
     */
    const eventData = TestDataFactory.createEventWithSpecialCharacters();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);

    // 일정이 목록에서 제거되었는지 확인
    await listPage.waitForEventToDisappear(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(false);
  });

  test('긴 제목의 일정 삭제', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 긴 제목의 일정이 생성됨
     * When: 해당 일정을 삭제함
     * Then: 일정이 올바르게 삭제됨
     */
    const eventData = TestDataFactory.createLongTitleEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title.substring(0, 20));

    // 일정 삭제 (부분 제목으로 찾기)
    await listPage.deleteEventByTitle(eventData.title.substring(0, 30));

    // 일정이 목록에서 제거되었는지 확인
    const hasEvent = await listPage.hasEventWithTitle(
      eventData.title.substring(0, 20)
    );
    expect(hasEvent).toBe(false);
  });

  test('API를 통해 생성된 일정 삭제', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 API를 통해 일정이 생성됨
     * When: 해당 일정을 UI를 통해 삭제함
     * Then: 일정이 올바르게 삭제됨
     */
    const eventData = TestDataFactory.createBasicEvent();

    // API를 통해 일정 생성
    await appContext.createEventViaAPI(eventData);

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 일정이 목록에 표시되는지 확인
    await listPage.waitForEventList();
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);

    // 일정이 목록에서 제거되었는지 확인
    await listPage.waitForEventToDisappear(eventData.title);
    const hasDeletedEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasDeletedEvent).toBe(false);
  });

  test('모든 일정 삭제 후 빈 목록 상태', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 여러 일정이 생성됨
     * When: 모든 일정을 삭제함
     * Then: 목록이 비어있음
     */
    const events = TestDataFactory.createSearchTestEvents().slice(0, 2);

    // 여러 일정 생성
    for (const event of events) {
      await formPage.clearForm();
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);
    }

    // 모든 일정 삭제
    for (const event of events) {
      await listPage.deleteEventByTitle(event.title);
      await listPage.waitForEventToDisappear(event.title);
    }

    // 목록이 비어있는지 확인
    const eventCount = await listPage.getEventCount();
    expect(eventCount).toBe(0);
  });

  test('삭제 후 동일한 제목으로 새 일정 생성', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성되고 삭제됨
     * When: 동일한 제목으로 새 일정을 생성함
     * Then: 새 일정이 생성됨
     */
    const eventData = TestDataFactory.createBasicEvent();

    // 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(eventData.title);

    // 일정 삭제
    await listPage.deleteEventByTitle(eventData.title);
    await listPage.waitForEventToDisappear(eventData.title);

    // 동일한 제목으로 새 일정 생성
    await formPage.fillEventForm(eventData);
    await formPage.clickAddEvent();

    // 새 일정이 목록에 표시되는지 확인
    await listPage.waitForEvent(eventData.title);
    const hasEvent = await listPage.hasEventWithTitle(eventData.title);
    expect(hasEvent).toBe(true);
  });
});
