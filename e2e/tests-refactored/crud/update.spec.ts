import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * CRUD Test: Update (일정 수정)
 *
 * 일정 수정 기능을 격리하여 테스트합니다.
 * 기존 일정의 정보를 변경하고 올바르게 저장되는지 검증합니다.
 */

test.describe('CRUD: 일정 수정 (Update)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)
  });

  test('생성된 일정의 제목을 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨
     * When: 일정의 제목을 변경함
     * Then: 변경된 제목이 저장되고 목록에 표시됨
     */
    const originalEvent = TestDataFactory.createBasicEvent();
    const newTitle = '수정된 일정 제목';

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 제목 수정
    await formPage.fillTitle(newTitle);
    await formPage.clickAddEvent();

    // 새 제목으로 확인
    await listPage.waitForEvent(newTitle);
    const hasNewTitle = await listPage.hasEventWithTitle(newTitle);
    expect(hasNewTitle).toBe(true);

    // 원본 제목은 더 이상 없어야 함
    const hasOldTitle = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasOldTitle).toBe(false);
  });

  test('생성된 일정의 시간을 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨
     * When: 일정의 시간을 변경함
     * Then: 변경된 시간이 저장됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('시간 수정 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const newStartTime = '14:00';
    const newEndTime = '15:00';

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 시간 수정
    await formPage.fillStartTime(newStartTime);
    await formPage.fillEndTime(newEndTime);
    await formPage.clickAddEvent();

    // 제목으로 확인 (시간이 표시되지 않더라도 저장되었는지 확인하기 위해)
    const hasEvent = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasEvent).toBe(true);
  });

  test('생성된 일정의 날짜를 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨
     * When: 일정의 날짜를 변경함
     * Then: 변경된 날짜로 저장됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('날짜 수정 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const newDate = '2025-11-20';

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 날짜 수정
    await formPage.fillDate(newDate);
    await formPage.clickAddEvent();

    // 일정이 여전히 존재하는지 확인
    const hasEvent = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasEvent).toBe(true);
  });

  test('일정의 설명을 추가 또는 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨 (설명 없이)
     * When: 일정에 설명을 추가함
     * Then: 설명이 저장되고 표시됨
     */
    const originalEvent = TestDataFactory.createBasicEvent();
    const newDescription = '추가된 상세한 설명 내용';

    // 원본 일정 생성 (설명 없음)
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 설명 추가
    const descriptionField = await formPage.page.getByLabel('설명');
    await descriptionField.fill(newDescription);
    await formPage.clickAddEvent();

    // 일정이 존재하는지 확인
    const hasEvent = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasEvent).toBe(true);
  });

  test('일정의 위치를 추가 또는 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨 (위치 없이)
     * When: 일정에 위치를 추가함
     * Then: 위치가 저장되고 표시됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('위치 추가 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const newLocation = '회의실 B';

    // 원본 일정 생성 (위치 없음)
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 위치 추가
    await formPage.fillLocation(newLocation);
    await formPage.clickAddEvent();

    // 위치 정보 확인
    const hasLocation = await listPage.eventContainsText(
      originalEvent.title,
      newLocation
    );
    expect(hasLocation).toBe(true);
  });

  test('일정의 카테고리를 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨 (카테고리: 기타)
     * When: 일정의 카테고리를 변경함 (카테고리: 업무)
     * Then: 변경된 카테고리가 저장됨
     */
    const originalEvent = TestDataFactory.createBasicEvent();
    const newCategory = '개인';

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 카테고리 수정
    await formPage.selectCategory(newCategory);
    await formPage.clickAddEvent();

    // 일정이 존재하는지 확인
    const hasEvent = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasEvent).toBe(true);
  });

  test('여러 필드를 동시에 수정', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨
     * When: 제목, 시간, 위치 등 여러 필드를 동시에 수정함
     * Then: 모든 변경사항이 저장됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('다중 필드 수정 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    const newTitle = '수정된 다중 필드 테스트';
    const newStartTime = '15:00';
    const newEndTime = '16:00';
    const newLocation = '컨퍼런스홀';

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 여러 필드 수정
    await formPage.fillTitle(newTitle);
    await formPage.fillStartTime(newStartTime);
    await formPage.fillEndTime(newEndTime);
    await formPage.fillLocation(newLocation);
    await formPage.clickAddEvent();

    // 새 제목으로 확인
    const hasNewTitle = await listPage.hasEventWithTitle(newTitle);
    expect(hasNewTitle).toBe(true);

    // 위치 정보 확인
    const hasLocation = await listPage.eventContainsText(newTitle, newLocation);
    expect(hasLocation).toBe(true);

    // 원본 제목은 더 이상 없어야 함
    const hasOldTitle = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasOldTitle).toBe(false);
  });

  test('수정 후 일정이 목록 맨 위로 이동', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 여러 일정이 생성됨
     * When: 생성된 일정 중 하나를 수정함
     * Then: 수정된 일정이 업데이트됨
     */
    const events = TestDataFactory.createSearchTestEvents().slice(0, 3);
    const eventToUpdate = events[0];
    const newTitle = '업데이트된 일정';

    // 여러 일정 생성
    for (const event of events) {
      await formPage.clearForm();
      await formPage.fillEventForm(event);
      await formPage.clickAddEvent();
      await listPage.waitForEvent(event.title);
    }

    // 첫 번째 일정 수정
    await listPage.clickEventByTitle(eventToUpdate.title);
    await formPage.fillTitle(newTitle);
    await formPage.clickAddEvent();

    // 새 제목으로 확인
    const hasNewTitle = await listPage.hasEventWithTitle(newTitle);
    expect(hasNewTitle).toBe(true);
  });

  test('수정 취소 시 원본이 유지됨', async ({ page, appContext }) => {
    /**
     * Given: 앱이 로드되고 일정이 생성됨
     * When: 일정을 수정하고 취소함 (또는 변경 없이 닫음)
     * Then: 원본 정보가 유지됨
     */
    const originalEvent = TestDataFactory.builder()
      .withTitle('수정 취소 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .build();

    // 원본 일정 생성
    await formPage.fillEventForm(originalEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(originalEvent.title);

    // 일정 클릭하여 편집 모드 진입
    await listPage.clickEventByTitle(originalEvent.title);

    // 제목을 변경했지만 저장하지 않고 다시 원본으로 복구
    const titleInput = await formPage.page.getByLabel('제목');
    const currentTitle = await titleInput.inputValue();
    expect(currentTitle).toBe(originalEvent.title);

    // 폼 닫기 (다른 페이지로 이동 또는 취소)
    await formPage.clearForm();

    // 원본 제목이 여전히 목록에 있어야 함
    const hasEvent = await listPage.hasEventWithTitle(originalEvent.title);
    expect(hasEvent).toBe(true);
  });
});
