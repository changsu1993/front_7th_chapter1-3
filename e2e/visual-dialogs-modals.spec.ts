import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test: 다이얼로그 및 모달
 *
 * 테스트 목적:
 * - 다이얼로그와 모달의 시각적 표현이 올바른지 검증
 * - 다양한 다이얼로그 타입(겹침 경고, 반복 일정 수정/삭제)의 스타일 일관성 확인
 *
 * 테스트 시나리오:
 * 1. 일정 겹침 경고 다이얼로그
 * 2. 반복 일정 수정 다이얼로그
 * 3. 반복 일정 삭제 다이얼로그
 * 4. 알림 표시 (스낵바/토스트)
 * 5. 다이얼로그 버튼 호버 상태
 */

test.describe('Visual Regression: 다이얼로그 및 모달', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!')).toBeVisible();
  });

  test('일정 겹침 경고 다이얼로그', async ({ page }) => {
    /**
     * 목적: 겹침 경고 다이얼로그의 시각적 표현
     */
    // 첫 번째 일정 생성
    await page.getByLabel('제목').fill('기존 일정');
    await page.getByLabel('날짜').fill('2025-11-01');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 겹치는 일정 생성 시도
    await page.getByLabel('제목').fill('겹치는 일정');
    await page.getByLabel('날짜').fill('2025-11-01');
    await page.getByLabel('시작 시간').fill('14:30');
    await page.getByLabel('종료 시간').fill('15:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고 다이얼로그 표시 대기
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // 다이얼로그 스크린샷
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveScreenshot('dialog-overlap-warning.png', {
      animations: 'disabled',
    });
  });

  test('반복 일정 수정 다이얼로그', async ({ page }) => {
    /**
     * 목적: 반복 일정 수정 시 다이얼로그의 시각적 표현
     */
    // 반복 일정 생성
    await page.getByLabel('제목').fill('반복 일정 테스트');
    await page.getByLabel('날짜').fill('2025-11-02');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 반복 일정 클릭하여 수정
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('반복 일정 테스트').first().click();

    // 제목 수정
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 제목');

    // 일정 수정 버튼 클릭
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 반복 일정 수정 다이얼로그 대기
    await expect(page.getByText('반복 일정 수정')).toBeVisible();

    // 다이얼로그 스크린샷
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveScreenshot('dialog-recurring-edit.png', {
      animations: 'disabled',
    });
  });

  test('반복 일정 삭제 다이얼로그', async ({ page }) => {
    /**
     * 목적: 반복 일정 삭제 시 다이얼로그의 시각적 표현
     */
    // 반복 일정 생성
    await page.getByLabel('제목').fill('삭제 테스트 반복');
    await page.getByLabel('날짜').fill('2025-11-03');
    await page.getByLabel('시작 시간').fill('13:00');
    await page.getByLabel('종료 시간').fill('14:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'weekly' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 삭제 버튼 클릭
    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('li').filter({ hasText: '삭제 테스트 반복' }).first();
    await eventCard.getByRole('button', { name: '삭제' }).click();

    // 반복 일정 삭제 다이얼로그 대기
    await expect(page.getByText('반복 일정 삭제')).toBeVisible();

    // 다이얼로그 스크린샷
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveScreenshot('dialog-recurring-delete.png', {
      animations: 'disabled',
    });
  });

  test('성공 알림 (스낵바) - 일정 추가', async ({ page }) => {
    /**
     * 목적: 일정 추가 성공 시 스낵바의 시각적 표현
     */
    await page.getByLabel('제목').fill('알림 테스트');
    await page.getByLabel('날짜').fill('2025-11-04');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 성공 메시지 대기
    const successMessage = page.getByText('일정이 추가되었습니다');
    await expect(successMessage).toBeVisible();

    // 스낵바 스크린샷
    await expect(page).toHaveScreenshot('snackbar-event-added.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('성공 알림 (스낵바) - 일정 수정', async ({ page }) => {
    /**
     * 목적: 일정 수정 성공 시 스낵바의 시각적 표현
     */
    // 일정 생성
    await page.getByLabel('제목').fill('수정 테스트');
    await page.getByLabel('날짜').fill('2025-11-05');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정 수정
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('수정 테스트').click();
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정됨');
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 수정 성공 메시지 대기
    const successMessage = page.getByText('일정이 수정되었습니다');
    await expect(successMessage).toBeVisible();

    // 스낵바 스크린샷
    await expect(page).toHaveScreenshot('snackbar-event-updated.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('성공 알림 (스낵바) - 일정 삭제', async ({ page }) => {
    /**
     * 목적: 일정 삭제 성공 시 스낵바의 시각적 표현
     */
    // 일정 생성
    await page.getByLabel('제목').fill('삭제 테스트');
    await page.getByLabel('날짜').fill('2025-11-06');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정 삭제
    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('li').filter({ hasText: '삭제 테스트' }).first();
    await eventCard.getByRole('button', { name: '삭제' }).click();

    // 삭제 성공 메시지 대기
    const successMessage = page.getByText('일정이 삭제되었습니다');
    await expect(successMessage).toBeVisible();

    // 스낵바 스크린샷
    await expect(page).toHaveScreenshot('snackbar-event-deleted.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('다이얼로그 버튼 호버 상태', async ({ page }) => {
    /**
     * 목적: 다이얼로그 버튼에 호버 시 시각적 변화
     */
    // 겹침 경고 다이얼로그 표시
    await page.getByLabel('제목').fill('일정 A');
    await page.getByLabel('날짜').fill('2025-11-07');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    await page.getByLabel('제목').fill('일정 B');
    await page.getByLabel('날짜').fill('2025-11-07');
    await page.getByLabel('시작 시간').fill('10:30');
    await page.getByLabel('종료 시간').fill('11:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // "계속" 버튼에 호버
    const continueButton = page.getByRole('button', { name: '계속' });
    await continueButton.hover();

    // 호버 상태 스크린샷
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveScreenshot('dialog-button-hover.png', {
      animations: 'disabled',
    });
  });

  test('여러 겹치는 일정 정보가 포함된 다이얼로그', async ({ page }) => {
    /**
     * 목적: 여러 일정과 겹칠 때 다이얼로그에 모든 정보 표시
     */
    // 첫 번째 일정
    await page.getByLabel('제목').fill('회의 A');
    await page.getByLabel('날짜').fill('2025-11-08');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 두 번째 일정 (첫 번째와 겹침, 경고 무시)
    await page.getByLabel('제목').fill('회의 B');
    await page.getByLabel('날짜').fill('2025-11-08');
    await page.getByLabel('시작 시간').fill('14:30');
    await page.getByLabel('종료 시간').fill('15:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await page.getByRole('button', { name: '계속' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 세 번째 일정 (앞의 두 일정과 모두 겹침)
    await page.getByLabel('제목').fill('회의 C');
    await page.getByLabel('날짜').fill('2025-11-08');
    await page.getByLabel('시작 시간').fill('14:15');
    await page.getByLabel('종료 시간').fill('15:15');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 여러 일정 겹침 다이얼로그
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();

    // 다이얼로그 스크린샷
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveScreenshot('dialog-multiple-overlaps.png', {
      animations: 'disabled',
    });
  });

  test('다이얼로그 닫기 애니메이션 비활성화', async ({ page }) => {
    /**
     * 목적: 다이얼로그가 닫힐 때 애니메이션이 비활성화되어 일관된 스크린샷 확보
     */
    // 반복 일정 생성 및 삭제 다이얼로그 표시
    await page.getByLabel('제목').fill('애니메이션 테스트');
    await page.getByLabel('날짜').fill('2025-11-09');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('li').filter({ hasText: '애니메이션 테스트' }).first();
    await eventCard.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByText('반복 일정 삭제')).toBeVisible();

    // 다이얼로그 스크린샷 (애니메이션 비활성화)
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveScreenshot('dialog-animation-disabled.png', {
      animations: 'disabled',
    });
  });
});
