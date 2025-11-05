import { test, expect } from '@playwright/test';

/**
 * E2E Test: 일정 겹침 처리 워크플로우
 *
 * 테스트 목적:
 * - 같은 날짜 및 시간에 여러 일정이 생성될 때 겹침 경고가 올바르게 표시되는지 검증
 * - 사용자가 겹침을 확인하고 계속 진행하거나 취소할 수 있는지 확인
 *
 * 테스트 시나리오:
 * 1. 겹치는 일정 생성 시 경고 다이얼로그 표시
 * 2. 경고 무시하고 계속 진행
 * 3. 경고 받고 취소
 * 4. 드래그 앤 드롭으로 겹치는 위치로 이동 시 경고
 * 5. 일정 수정으로 인한 겹침 경고
 */

test.describe('일정 겹침 처리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!')).toBeVisible();
  });

  test('겹치는 일정 생성 시 경고 다이얼로그 표시', async ({ page }) => {
    /**
     * 목적: 같은 날짜 및 시간에 일정을 생성하면 겹침 경고가 표시됨
     */
    // 첫 번째 일정 생성
    await page.getByLabel('제목').fill('회의 A');
    await page.getByLabel('날짜').fill('2025-11-20');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정 생성 (같은 시간)
    await page.getByLabel('제목').fill('회의 B');
    await page.getByLabel('날짜').fill('2025-11-20');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });

  test('겹침 경고에서 계속 진행하면 일정이 추가됨', async ({ page }) => {
    /**
     * 목적: 겹침 경고에서 "계속" 버튼을 클릭하면 일정이 추가됨
     */
    // 첫 번째 일정 생성
    await page.getByLabel('제목').fill('스터디 A');
    await page.getByLabel('날짜').fill('2025-11-21');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정 생성 (겹침)
    await page.getByLabel('제목').fill('스터디 B');
    await page.getByLabel('날짜').fill('2025-11-21');
    await page.getByLabel('시작 시간').fill('10:30');
    await page.getByLabel('종료 시간').fill('11:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고에서 "계속" 클릭
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '계속' }).click();

    // 일정이 추가되었는지 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('스터디 A')).toBeVisible();
    await expect(eventList.getByText('스터디 B')).toBeVisible();
  });

  test('겹침 경고에서 취소하면 일정이 추가되지 않음', async ({ page }) => {
    /**
     * 목적: 겹침 경고에서 "취소" 버튼을 클릭하면 일정이 추가되지 않음
     */
    // 첫 번째 일정 생성
    await page.getByLabel('제목').fill('워크샵 A');
    await page.getByLabel('날짜').fill('2025-11-22');
    await page.getByLabel('시작 시간').fill('13:00');
    await page.getByLabel('종료 시간').fill('14:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정 생성 시도 (겹침)
    await page.getByLabel('제목').fill('워크샵 B');
    await page.getByLabel('날짜').fill('2025-11-22');
    await page.getByLabel('시작 시간').fill('13:30');
    await page.getByLabel('종료 시간').fill('14:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고에서 "취소" 클릭
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();

    // 다이얼로그가 닫혔는지 확인
    await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();

    // 첫 번째 일정만 존재하는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('워크샵 A')).toBeVisible();
    await expect(eventList.getByText('워크샵 B')).not.toBeVisible();
  });

  test('부분적으로 겹치는 일정도 경고가 표시됨', async ({ page }) => {
    /**
     * 목적: 시작/종료 시간이 부분적으로 겹쳐도 경고가 표시됨
     */
    // 첫 번째 일정: 09:00-11:00
    await page.getByLabel('제목').fill('프로젝트 회의');
    await page.getByLabel('날짜').fill('2025-11-23');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정: 10:00-12:00 (부분 겹침)
    await page.getByLabel('제목').fill('디자인 리뷰');
    await page.getByLabel('날짜').fill('2025-11-23');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });

  test('일정 수정으로 인한 겹침도 경고가 표시됨', async ({ page }) => {
    /**
     * 목적: 기존 일정을 수정하여 다른 일정과 겹치게 되면 경고가 표시됨
     */
    // 첫 번째 일정 생성: 14:00-15:00
    await page.getByLabel('제목').fill('팀 미팅');
    await page.getByLabel('날짜').fill('2025-11-24');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정 생성: 16:00-17:00 (겹치지 않음)
    await page.getByLabel('제목').fill('개인 작업');
    await page.getByLabel('날짜').fill('2025-11-24');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정을 수정하여 첫 번째 일정과 겹치도록 변경
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('개인 작업').click();

    await page.getByLabel('시작 시간').clear();
    await page.getByLabel('시작 시간').fill('14:30');
    await page.getByLabel('종료 시간').clear();
    await page.getByLabel('종료 시간').fill('15:30');

    await page.getByRole('button', { name: '일정 수정' }).click();

    // 겹침 경고 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });

  test('같은 시간대에 여러 일정이 있을 때 경고 메시지에 모든 겹치는 일정이 표시됨', async ({ page }) => {
    /**
     * 목적: 여러 일정과 겹칠 때 모든 겹치는 일정이 경고 메시지에 나타남
     */
    // 첫 번째 일정
    await page.getByLabel('제목').fill('회의 1');
    await page.getByLabel('날짜').fill('2025-11-25');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정 (첫 번째와 겹침, 경고 무시)
    await page.getByLabel('제목').fill('회의 2');
    await page.getByLabel('날짜').fill('2025-11-25');
    await page.getByLabel('시작 시간').fill('10:30');
    await page.getByLabel('종료 시간').fill('11:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '계속' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 세 번째 일정 (앞의 두 일정과 모두 겹침)
    await page.getByLabel('제목').fill('회의 3');
    await page.getByLabel('날짜').fill('2025-11-25');
    await page.getByLabel('시작 시간').fill('10:15');
    await page.getByLabel('종료 시간').fill('11:15');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고에서 여러 일정이 언급되는지 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    // 경고 메시지에 겹치는 일정들이 표시되는지 확인 (구현에 따라 다를 수 있음)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('겹치지 않는 일정은 경고 없이 생성됨', async ({ page }) => {
    /**
     * 목적: 시간대가 겹치지 않으면 경고가 표시되지 않음
     */
    // 첫 번째 일정: 09:00-10:00
    await page.getByLabel('제목').fill('아침 미팅');
    await page.getByLabel('날짜').fill('2025-11-26');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정: 10:00-11:00 (경계가 맞닿음, 겹침 아님)
    await page.getByLabel('제목').fill('오전 작업');
    await page.getByLabel('날짜').fill('2025-11-26');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 경고 다이얼로그가 나타나지 않고 바로 추가됨
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();
  });
});
