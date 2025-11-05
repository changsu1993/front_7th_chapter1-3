import { test, expect } from '@playwright/test';

/**
 * E2E Test: 반복 일정 관리 워크플로우
 *
 * 테스트 목적:
 * - 반복 일정 생성, 수정, 삭제 워크플로우가 올바르게 동작하는지 검증
 * - 단일 인스턴스 수정/삭제와 전체 반복 일정 수정/삭제의 차이점 확인
 *
 * 테스트 시나리오:
 * 1. 반복 일정 생성 (daily, weekly, monthly)
 * 2. 반복 일정 목록에서 확인
 * 3. 단일 인스턴스만 수정
 * 4. 전체 반복 일정 수정
 * 5. 단일 인스턴스만 삭제
 * 6. 전체 반복 일정 삭제
 * 7. 다이얼로그 취소
 */

test.describe('반복 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!')).toBeVisible();
  });

  test('일간 반복 일정 생성 및 확인', async ({ page }) => {
    /**
     * 목적: 매일 반복되는 일정을 생성하고 목록에 표시되는지 확인
     */
    await page.getByLabel('제목').fill('매일 스탠드업 미팅');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('09:30');
    await page.getByLabel('설명').fill('매일 아침 스탠드업 미팅');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 반복 설정: 매일 반복
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');

    // 일정 추가
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 이벤트 리스트에서 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 스탠드업 미팅')).toBeVisible();
  });

  test('주간 반복 일정 생성', async ({ page }) => {
    /**
     * 목적: 매주 특정 요일에 반복되는 일정 생성
     */
    await page.getByLabel('제목').fill('주간 회의');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 반복 설정: 매주 반복
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'weekly' }).click();
    await page.getByLabel('반복 간격').fill('1');

    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 회의')).toBeVisible();
  });

  test('월간 반복 일정 생성', async ({ page }) => {
    /**
     * 목적: 매월 반복되는 일정 생성
     */
    await page.getByLabel('제목').fill('월간 보고');
    await page.getByLabel('날짜').fill('2025-11-01');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'monthly' }).click();
    await page.getByLabel('반복 간격').fill('1');

    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('월간 보고')).toBeVisible();
  });

  test('반복 일정 단일 인스턴스 수정', async ({ page }) => {
    /**
     * 목적: 반복 일정 수정 시 "이 일정만" 선택하면 단일 인스턴스만 수정됨
     */
    // 먼저 반복 일정 생성
    await page.getByLabel('제목').fill('반복 테스트 일정');
    await page.getByLabel('날짜').fill('2025-11-15');
    await page.getByLabel('시작 시간').fill('13:00');
    await page.getByLabel('종료 시간').fill('14:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 반복 일정 클릭하여 수정 시도
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('반복 테스트 일정').first().click();

    // 제목 수정
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('반복 테스트 일정 (단일 수정)');

    // 일정 수정 버튼 클릭
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 반복 일정 수정 다이얼로그가 나타나야 함
    await expect(page.getByText('반복 일정 수정')).toBeVisible();

    // "예" 버튼 클릭 (이 일정만)
    await page.getByRole('button', { name: '예' }).click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();
  });

  test('반복 일정 전체 수정', async ({ page }) => {
    /**
     * 목적: "아니오" 선택 시 모든 반복 일정이 수정됨
     */
    // 반복 일정 생성
    await page.getByLabel('제목').fill('전체 반복 수정 테스트');
    await page.getByLabel('날짜').fill('2025-11-16');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'weekly' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 반복 일정 클릭하여 수정
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('전체 반복 수정 테스트').first().click();

    // 시간 변경
    await page.getByLabel('시작 시간').clear();
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').clear();
    await page.getByLabel('종료 시간').fill('17:00');

    await page.getByRole('button', { name: '일정 수정' }).click();

    // 다이얼로그에서 "아니오" 선택 (모든 반복 일정)
    await expect(page.getByText('반복 일정 수정')).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click();

    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();
  });

  test('반복 일정 단일 인스턴스 삭제', async ({ page }) => {
    /**
     * 목적: 반복 일정 삭제 시 "이 일정만" 선택하면 단일 인스턴스만 삭제됨
     */
    // 반복 일정 생성
    await page.getByLabel('제목').fill('삭제 테스트 반복 일정');
    await page.getByLabel('날짜').fill('2025-11-17');
    await page.getByLabel('시작 시간').fill('11:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 삭제 버튼 클릭
    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('li').filter({ hasText: '삭제 테스트 반복 일정' }).first();
    await eventCard.getByRole('button', { name: '삭제' }).click();

    // 반복 일정 삭제 다이얼로그 확인
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();

    // "예" 버튼 클릭 (이 일정만)
    await page.getByRole('button', { name: '예' }).click();

    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();
  });

  test('반복 일정 전체 삭제', async ({ page }) => {
    /**
     * 목적: "아니오" 선택 시 모든 반복 일정이 삭제됨
     */
    // 반복 일정 생성
    await page.getByLabel('제목').fill('전체 삭제 테스트');
    await page.getByLabel('날짜').fill('2025-11-18');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'weekly' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 삭제 버튼 클릭
    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('li').filter({ hasText: '전체 삭제 테스트' }).first();
    await eventCard.getByRole('button', { name: '삭제' }).click();

    // 다이얼로그에서 "아니오" 선택 (모든 반복 일정)
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click();

    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();

    // 모든 인스턴스가 삭제되었는지 확인
    await expect(eventList.getByText('전체 삭제 테스트')).not.toBeVisible();
  });

  test('반복 일정 다이얼로그에서 취소', async ({ page }) => {
    /**
     * 목적: 반복 일정 수정/삭제 다이얼로그에서 취소하면 작업이 중단됨
     */
    // 반복 일정 생성
    await page.getByLabel('제목').fill('취소 테스트 반복 일정');
    await page.getByLabel('날짜').fill('2025-11-19');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 삭제 버튼 클릭
    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('li').filter({ hasText: '취소 테스트 반복 일정' }).first();
    await eventCard.getByRole('button', { name: '삭제' }).click();

    // 다이얼로그 확인
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();

    // 취소 버튼 클릭
    await page.getByRole('button', { name: '취소' }).click();

    // 다이얼로그가 닫혔는지 확인
    await expect(page.getByText('반복 일정 삭제')).not.toBeVisible();

    // 일정이 여전히 존재하는지 확인
    await expect(eventList.getByText('취소 테스트 반복 일정')).toBeVisible();
  });
});
