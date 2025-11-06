import { test, expect } from '@playwright/test';

/**
 * E2E Test: 검색 및 필터링 워크플로우
 *
 * 테스트 목적:
 * - 일정 검색 기능이 올바르게 동작하는지 검증
 * - 다양한 필드(제목, 설명, 위치, 카테고리)로 검색 가능한지 확인
 * - 검색 결과가 정확하게 필터링되는지 확인
 *
 * 테스트 시나리오:
 * 1. 제목으로 검색
 * 2. 설명으로 검색
 * 3. 위치로 검색
 * 4. 부분 문자열 검색
 * 5. 대소문자 구분 없이 검색
 * 6. 검색어 입력 시 실시간 필터링
 * 7. 검색어 지우면 전체 목록 표시
 * 8. 검색 결과 없음 처리
 */

test.describe('검색 및 필터링 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!').first()).toBeVisible();

    // 테스트용 여러 일정 생성
    const testEvents = [
      {
        title: '팀 회의',
        date: '2025-12-01',
        time: { start: '10:00', end: '11:00' },
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
      },
      {
        title: '프로젝트 리뷰',
        date: '2025-12-02',
        time: { start: '14:00', end: '15:00' },
        description: '분기 프로젝트 검토',
        location: '회의실 B',
        category: '업무',
      },
      {
        title: '개인 운동',
        date: '2025-12-03',
        time: { start: '18:00', end: '19:00' },
        description: '헬스장 운동',
        location: '피트니스 센터',
        category: '개인',
      },
      {
        title: '점심 약속',
        date: '2025-12-04',
        time: { start: '12:00', end: '13:00' },
        description: '친구와 점심',
        location: '강남역 맛집',
        category: '개인',
      },
    ];

    for (const event of testEvents) {
      await page.getByLabel('제목').fill(event.title);
      await page.getByLabel('날짜').fill(event.date);
      await page.getByLabel('시작 시간').fill(event.time.start);
      await page.getByLabel('종료 시간').fill(event.time.end);
      await page.getByLabel('설명').fill(event.description);
      await page.getByLabel('위치').fill(event.location);
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: event.category }).click();
      await page.getByRole('button', { name: '일정 추가' }).click();
    }
  });

  test('제목으로 검색', async ({ page }) => {
    /**
     * 목적: 일정 제목으로 검색하여 필터링
     */
    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('회의');

    const eventList = page.getByTestId('event-list');

    // "회의"가 포함된 일정만 표시
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('프로젝트 리뷰')).not.toBeVisible();
    await expect(eventList.getByText('개인 운동')).not.toBeVisible();
  });

  test('설명으로 검색', async ({ page }) => {
    /**
     * 목적: 일정 설명으로 검색하여 필터링
     */
    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('프로젝트');

    const eventList = page.getByTestId('event-list');

    // "프로젝트"가 포함된 일정만 표시
    await expect(eventList.getByText('프로젝트 리뷰')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();
  });

  test('위치로 검색', async ({ page }) => {
    /**
     * 목적: 일정 위치로 검색하여 필터링
     */
    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('회의실');

    const eventList = page.getByTestId('event-list');

    // "회의실"이 포함된 일정들만 표시
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('프로젝트 리뷰')).toBeVisible();
    await expect(eventList.getByText('개인 운동')).not.toBeVisible();
    await expect(eventList.getByText('점심 약속')).not.toBeVisible();
  });

  test('부분 문자열 검색', async ({ page }) => {
    /**
     * 목적: 단어의 일부만 입력해도 검색 가능
     */
    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('점심');

    const eventList = page.getByTestId('event-list');

    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();
  });

  test('대소문자 구분 없이 검색 (영문의 경우)', async ({ page }) => {
    /**
     * 목적: 대소문자 구분 없이 검색 가능
     */
    // 영문 일정 추가
    await page.getByLabel('제목').fill('Team Meeting');
    await page.getByLabel('날짜').fill('2025-12-05');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    const searchInput = page.getByLabel('일정 검색');

    // 소문자로 검색
    await searchInput.fill('team');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('Team Meeting')).toBeVisible();

    // 대문자로 검색
    await searchInput.clear();
    await searchInput.fill('TEAM');
    await expect(eventList.getByText('Team Meeting')).toBeVisible();

    // 혼합 케이스로 검색
    await searchInput.clear();
    await searchInput.fill('TeAm');
    await expect(eventList.getByText('Team Meeting')).toBeVisible();
  });

  test('검색어 입력 시 실시간 필터링', async ({ page }) => {
    /**
     * 목적: 타이핑하는 즉시 결과가 업데이트됨
     */
    const searchInput = page.getByLabel('일정 검색');
    const eventList = page.getByTestId('event-list');

    // '팀' 입력
    await searchInput.fill('팀');
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('프로젝트 리뷰')).not.toBeVisible();

    // '팀 회' 입력
    await searchInput.fill('팀 회');
    await expect(eventList.getByText('팀 회의')).toBeVisible();

    // '팀 회의' 완전히 입력
    await searchInput.fill('팀 회의');
    await expect(eventList.getByText('팀 회의')).toBeVisible();
  });

  test('검색어 지우면 전체 목록 표시', async ({ page }) => {
    /**
     * 목적: 검색어를 지우면 모든 일정이 다시 표시됨
     */
    const searchInput = page.getByLabel('일정 검색');
    const eventList = page.getByTestId('event-list');

    // 검색 실행
    await searchInput.fill('회의');
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('개인 운동')).not.toBeVisible();

    // 검색어 지우기
    await searchInput.clear();

    // 모든 일정 다시 표시
    await expect(eventList.getByText('팀 회의')).toBeVisible();
    await expect(eventList.getByText('프로젝트 리뷰')).toBeVisible();
    await expect(eventList.getByText('개인 운동')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible();
  });

  test('검색 결과 없음 처리', async ({ page }) => {
    /**
     * 목적: 검색 결과가 없을 때 적절한 메시지나 빈 목록 표시
     */
    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('존재하지않는일정');

    const eventList = page.getByTestId('event-list');

    // 기존 일정들이 모두 표시되지 않음
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();
    await expect(eventList.getByText('프로젝트 리뷰')).not.toBeVisible();
    await expect(eventList.getByText('개인 운동')).not.toBeVisible();
    await expect(eventList.getByText('점심 약속')).not.toBeVisible();

    // "검색 결과가 없습니다" 메시지가 표시될 수 있음 (구현에 따라)
    // await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
  });

  test('여러 필드에 걸쳐 검색', async ({ page }) => {
    /**
     * 목적: 제목, 설명, 위치 등 여러 필드를 통합 검색
     */
    const searchInput = page.getByLabel('일정 검색');
    const eventList = page.getByTestId('event-list');

    // "강남"으로 검색 - 위치에 포함
    await searchInput.fill('강남');
    await expect(eventList.getByText('점심 약속')).toBeVisible();

    // "헬스"로 검색 - 설명에 포함
    await searchInput.clear();
    await searchInput.fill('헬스');
    await expect(eventList.getByText('개인 운동')).toBeVisible();

    // "분기"로 검색 - 설명에 포함
    await searchInput.clear();
    await searchInput.fill('분기');
    await expect(eventList.getByText('프로젝트 리뷰')).toBeVisible();
  });

  test('특수문자 포함 검색', async ({ page }) => {
    /**
     * 목적: 특수문자가 포함된 검색어도 처리 가능
     */
    // 특수문자가 포함된 일정 추가
    await page.getByLabel('제목').fill('회의 (긴급)');
    await page.getByLabel('날짜').fill('2025-12-06');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('(긴급)');

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의 (긴급)')).toBeVisible();
  });

  test('숫자로 검색', async ({ page }) => {
    /**
     * 목적: 날짜나 숫자가 포함된 내용도 검색 가능
     */
    // 숫자가 포함된 일정 추가
    await page.getByLabel('제목').fill('2025년 결산');
    await page.getByLabel('날짜').fill('2025-12-07');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('2025');

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('2025년 결산')).toBeVisible();
  });

  test('공백 처리 검색', async ({ page }) => {
    /**
     * 목적: 앞뒤 공백이 있어도 올바르게 검색
     */
    const searchInput = page.getByLabel('일정 검색');

    // 앞뒤에 공백 있음
    await searchInput.fill('  팀 회의  ');

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의')).toBeVisible();
  });

  test('연속된 검색어 입력', async ({ page }) => {
    /**
     * 목적: 여러 번 연속으로 검색해도 정상 동작
     */
    const searchInput = page.getByLabel('일정 검색');
    const eventList = page.getByTestId('event-list');

    // 첫 번째 검색
    await searchInput.fill('회의');
    await expect(eventList.getByText('팀 회의')).toBeVisible();

    // 두 번째 검색
    await searchInput.clear();
    await searchInput.fill('운동');
    await expect(eventList.getByText('개인 운동')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();

    // 세 번째 검색
    await searchInput.clear();
    await searchInput.fill('점심');
    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('개인 운동')).not.toBeVisible();
  });
});
