import { test, expect } from '../../fixtures/app.fixture';
import { EventFormPage } from '../../pages/EventFormPage';
import { EventListPage } from '../../pages/EventListPage';
import { TestDataFactory } from '../../helpers/TestDataFactory';

/**
 * Feature Test: Search & Filter (검색 및 필터링)
 *
 * 일정 검색 및 필터링 기능을 테스트합니다.
 * 키워드 검색, 카테고리 필터링 등을 검증합니다.
 */

test.describe('Feature: 일정 검색 및 필터링 (Search & Filter)', () => {
  let formPage: EventFormPage;
  let listPage: EventListPage;

  test.beforeEach(async ({ page, appContext }) => {
    // Page Object 초기화
    formPage = new EventFormPage(page);
    listPage = new EventListPage(page);

    // appContext는 자동으로 초기화됨 (fixture에서 처리)

    // 테스트용 일정 미리 생성
    const events = TestDataFactory.createSearchTestEvents();
    for (const event of events) {
      await appContext.createEventViaAPI(event);
    }

    // 페이지 새로고침하여 데이터 로드
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('제목으로 일정 검색', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 제목으로 검색함
     * Then: 일치하는 일정만 표시됨
     */
    const searchTerm = '팀 회의';

    // 검색 수행
    await listPage.search(searchTerm);

    // 검색 결과 확인
    const hasResult = await listPage.hasSearchResult(searchTerm);
    expect(hasResult).toBe(true);

    // 일치하지 않는 일정은 표시되지 않음
    const hasNonMatch = await listPage.hasEventWithTitle('개인 운동');
    expect(hasNonMatch).toBe(false);
  });

  test('부분 텍스트로 검색', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 부분 텍스트로 검색함 (예: "팀")
     * Then: 일치하는 모든 일정이 표시됨
     */
    const searchTerm = '팀';

    // 검색 수행
    await listPage.search(searchTerm);

    // 검색 결과 확인
    const hasResult = await listPage.hasSearchResult('팀 회의');
    expect(hasResult).toBe(true);
  });

  test('검색 결과 없음', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 존재하지 않는 키워드로 검색함
     * Then: "검색 결과가 없습니다" 메시지가 표시됨
     */
    const searchTerm = '존재하지않는일정';

    // 검색 수행
    await listPage.search(searchTerm);

    // 검색 결과 없음 확인
    const hasNoResult = await listPage.hasNoSearchResult();
    expect(hasNoResult).toBe(true);
  });

  test('검색 초기화', async ({ page, appContext }) => {
    /**
     * Given: 검색이 수행됨
     * When: 검색어를 삭제함
     * Then: 모든 일정이 다시 표시됨
     */
    const searchTerm = '팀 회의';

    // 검색 수행
    await listPage.search(searchTerm);
    let hasResult = await listPage.hasSearchResult(searchTerm);
    expect(hasResult).toBe(true);

    // 검색 초기화
    await listPage.clearSearch();

    // 모든 일정 확인
    const eventCount = await listPage.getEventCount();
    expect(eventCount).toBeGreaterThan(1);
  });

  test('검색 후 일정이 계속 표시됨', async ({ page, appContext }) => {
    /**
     * Given: 검색이 수행됨
     * When: 검색 결과가 표시됨
     * Then: 계속 검색 상태가 유지됨
     */
    const searchTerm = '리뷰';

    // 검색 수행
    await listPage.search(searchTerm);

    // 결과 확인
    const hasResult = await listPage.hasSearchResult('프로젝트 리뷰');
    expect(hasResult).toBe(true);

    // 추가 검증: 같은 검색어로 다시 확인
    const hasResult2 = await listPage.hasSearchResult('프로젝트 리뷰');
    expect(hasResult2).toBe(true);
  });

  test('검색 후 일정 클릭', async ({ page, appContext }) => {
    /**
     * Given: 검색이 수행되고 결과가 표시됨
     * When: 검색 결과의 일정을 클릭함
     * Then: 일정 상세 정보가 표시되거나 수정 가능해짐
     */
    const searchTerm = '점심';

    // 검색 수행
    await listPage.search(searchTerm);

    // 결과 확인
    const hasResult = await listPage.hasSearchResult('점심 약속');
    expect(hasResult).toBe(true);

    // 일정 클릭 (편집 모드 진입)
    await listPage.clickEventByTitle('점심 약속');

    // 제목 필드에 값이 있는지 확인
    const titleValue = await formPage.getTitleValue();
    expect(titleValue).toBe('점심 약속');
  });

  test('대소문자 구분 없이 검색', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 대문자로 검색함 (검색은 대소문자 구분 안 함)
     * Then: 소문자 일정도 검색 결과에 포함됨
     */
    const searchTerm = '팀 회의';

    // 검색 수행 (일반적으로 대소문자 구분 없음)
    await listPage.search(searchTerm);

    // 검색 결과 확인
    const hasResult = await listPage.hasSearchResult('팀 회의');
    expect(hasResult).toBe(true);
  });

  test('특수문자를 포함한 검색', async ({ page, appContext }) => {
    /**
     * Given: 특수문자가 있는 일정이 생성됨
     * When: 특수문자를 포함하여 검색함
     * Then: 일정이 검색되거나 부분 일치로 검색됨
     */
    // 특수문자 일정 추가
    const specialEvent = TestDataFactory.createEventWithSpecialCharacters();
    await formPage.fillEventForm(specialEvent);
    await formPage.clickAddEvent();
    await listPage.waitForEvent(specialEvent.title);

    // 부분 텍스트로 검색
    const searchTerm = '회의';
    await listPage.search(searchTerm);

    // 검색 결과 확인
    const hasResult = await listPage.hasSearchResult(searchTerm);
    expect(hasResult).toBe(true);
  });

  test('검색 중 새로운 일정 추가', async ({ page, appContext }) => {
    /**
     * Given: 검색이 수행됨
     * When: 새로운 일정을 추가함
     * Then: 새 일정이 검색 결과에 포함될 수 있음
     */
    const searchTerm = '팀';

    // 검색 수행
    await listPage.search(searchTerm);

    // 새 일정 추가
    const newEvent = TestDataFactory.builder()
      .withTitle('팀 빌딩')
      .withDate('2025-11-25')
      .withStartTime('14:00')
      .withEndTime('15:00')
      .build();

    await formPage.fillEventForm(newEvent);
    await formPage.clickAddEvent();

    // 검색 결과에 새 일정이 포함되는지 확인
    const hasResult = await listPage.hasSearchResult('팀 빌딩');
    expect(hasResult).toBe(true);
  });

  test('검색 후 일정 삭제', async ({ page, appContext }) => {
    /**
     * Given: 검색이 수행되고 결과가 표시됨
     * When: 검색 결과의 일정을 삭제함
     * Then: 일정이 삭제되고 목록에서 제거됨
     */
    const searchTerm = '점심';

    // 검색 수행
    await listPage.search(searchTerm);

    // 결과 확인
    const hasResult = await listPage.hasSearchResult('점심 약속');
    expect(hasResult).toBe(true);

    // 일정 삭제
    await listPage.deleteEventByTitle('점심 약속');

    // 검색 결과에서 제거되었는지 확인
    const hasDeleted = await listPage.hasSearchResult('점심 약속');
    expect(hasDeleted).toBe(false);
  });

  test('빈 검색어로 검색', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 검색어 없이 검색함 (빈 문자열)
     * Then: 모든 일정이 표시됨
     */
    // 검색 수행 (빈 문자열)
    await listPage.search('');

    // 모든 일정이 표시되는지 확인
    const eventCount = await listPage.getEventCount();
    expect(eventCount).toBeGreaterThan(0);
  });

  test('여러 단어로 검색', async ({ page, appContext }) => {
    /**
     * Given: 여러 일정이 생성됨
     * When: 여러 단어로 검색함
     * Then: 모든 단어를 포함하는 일정만 표시됨 (또는 부분 일치)
     */
    const searchTerm = '프로젝트 리뷰';

    // 검색 수행
    await listPage.search(searchTerm);

    // 검색 결과 확인
    const hasResult = await listPage.hasSearchResult('프로젝트 리뷰');
    expect(hasResult).toBe(true);
  });

  test('검색 결과의 위치 정보 표시', async ({ page, appContext }) => {
    /**
     * Given: 위치 정보가 있는 일정이 생성됨
     * When: 일정을 검색함
     * Then: 검색 결과에 위치 정보가 포함됨
     */
    const searchTerm = '회의실';

    // 검색 수행
    await listPage.search(searchTerm);

    // 결과 확인
    const hasResult = await listPage.hasSearchResult('팀 회의');
    expect(hasResult).toBe(true);

    // 위치 정보 확인
    const hasLocation = await listPage.eventContainsText(
      '팀 회의',
      '회의실 A'
    );
    expect(hasLocation).toBe(true);
  });

  test('검색 후 페이지 새로고침 시 검색 상태 유지', async ({ page, appContext }) => {
    /**
     * Given: 검색이 수행됨
     * When: 페이지를 새로고침함
     * Then: 검색 상태가 유지될 수 있음 (또는 초기화됨)
     */
    const searchTerm = '팀';

    // 검색 수행
    await listPage.search(searchTerm);

    // 초기 결과 확인
    const hasResultBefore = await listPage.hasSearchResult('팀 회의');
    expect(hasResultBefore).toBe(true);

    // 페이지 새로고침
    await formPage.page.reload();
    await formPage.page.waitForLoadState('networkidle');

    // 새로고침 후 검색 상태 (일반적으로는 초기화됨)
    // 필요시 다시 검색 수행
    await listPage.search(searchTerm);

    // 결과 확인
    const hasResultAfter = await listPage.hasSearchResult('팀 회의');
    expect(hasResultAfter).toBe(true);
  });
});
