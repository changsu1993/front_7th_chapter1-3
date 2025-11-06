import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test: 일정 상태별 시각적 표현
 *
 * 테스트 목적:
 * - 일정의 다양한 상태(알림, 반복, 카테고리, 선택 등)가 시각적으로 올바르게 표현되는지 검증
 * - 각 상태에 따른 색상, 아이콘, 스타일링이 일관되게 나타나는지 확인
 *
 * 테스트 시나리오:
 * 1. 일반 일정
 * 2. 알림이 활성화된 일정 (빨간색/강조 표시)
 * 3. 반복 일정 (반복 아이콘 표시)
 * 4. 카테고리별 일정 (업무, 개인 등)
 * 5. 선택된 일정 (편집 중)
 * 6. 드래그 가능한 일정
 * 7. 겹치는 일정
 */

test.describe('Visual Regression: 일정 상태', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!').first()).toBeVisible();
  });

  test('일반 일정 표시', async ({ page }) => {
    /**
     * 목적: 기본 일정의 시각적 표현
     */
    await page.getByLabel('제목').fill('일반 일정');
    await page.getByLabel('날짜').fill('2025-10-15');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트 영역만 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('event-state-normal.png', {
      animations: 'disabled',
    });
  });

  test('알림이 활성화된 일정 (강조 표시)', async ({ page }) => {
    /**
     * 목적: 알림 시간이 된 일정은 빨간색이나 강조 스타일로 표시됨
     */
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 과거 시간의 일정 생성 (알림이 이미 발생)
    await page.getByLabel('제목').fill('알림 활성 일정');
    await page.getByLabel('날짜').fill(dateStr);
    await page.getByLabel('시작 시간').fill('01:00');
    await page.getByLabel('종료 시간').fill('02:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '10분 전' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 알림이 표시된 일정 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('event-state-notified.png', {
      animations: 'disabled',
    });
  });

  test('반복 일정 (아이콘 표시)', async ({ page }) => {
    /**
     * 목적: 반복 일정은 반복 아이콘과 함께 표시됨
     */
    await page.getByLabel('제목').fill('반복 일정 시각 테스트');
    await page.getByLabel('날짜').fill('2025-10-16');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 반복 아이콘이 있는 일정 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('event-state-recurring.png', {
      animations: 'disabled',
    });
  });

  test('카테고리별 일정 (업무 vs 개인)', async ({ page }) => {
    /**
     * 목적: 카테고리에 따라 다른 시각적 표현
     */
    // 업무 카테고리 일정
    await page.getByLabel('제목').fill('업무 일정');
    await page.getByLabel('날짜').fill('2025-10-17');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 개인 카테고리 일정
    await page.getByLabel('제목').fill('개인 일정');
    await page.getByLabel('날짜').fill('2025-10-17');
    await page.getByLabel('시작 시간').fill('11:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 두 카테고리 일정 비교 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('event-state-categories.png', {
      animations: 'disabled',
    });
  });

  test('선택된 일정 (편집 모드)', async ({ page }) => {
    /**
     * 목적: 클릭하여 선택된 일정의 시각적 표현
     */
    // 일정 생성
    await page.getByLabel('제목').fill('선택 테스트 일정');
    await page.getByLabel('날짜').fill('2025-10-18');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 클릭하여 선택 (편집 모드로 진입)
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('선택 테스트 일정').click();

    // 선택된 상태의 폼 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('event-state-selected-form.png', {
      animations: 'disabled',
    });
  });

  test('드래그 가능한 일정 vs 반복 일정 (드래그 불가)', async ({ page }) => {
    /**
     * 목적: 드래그 가능 여부에 따른 시각적 차이
     */
    // 일반 일정 (드래그 가능)
    await page.getByLabel('제목').fill('드래그 가능 일정');
    await page.getByLabel('날짜').fill('2025-10-19');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 반복 일정 (드래그 불가)
    await page.getByLabel('제목').fill('드래그 불가 반복 일정');
    await page.getByLabel('날짜').fill('2025-10-19');
    await page.getByLabel('시작 시간').fill('12:00');
    await page.getByLabel('종료 시간').fill('13:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 주간 뷰로 전환 (드래그 가능 여부가 더 명확함)
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 스크린샷
    await expect(page).toHaveScreenshot('event-state-draggable-vs-non-draggable.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('겹치는 일정들', async ({ page }) => {
    /**
     * 목적: 시간이 겹치는 일정들의 시각적 표현
     */
    // 첫 번째 일정
    await page.getByLabel('제목').fill('겹침 일정 A');
    await page.getByLabel('날짜').fill('2025-10-20');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 두 번째 일정 (겹침, 경고 무시)
    await page.getByLabel('제목').fill('겹침 일정 B');
    await page.getByLabel('날짜').fill('2025-10-20');
    await page.getByLabel('시작 시간').fill('14:30');
    await page.getByLabel('종료 시간').fill('15:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고 무시하고 계속
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '계속' }).click();

    // 겹치는 일정들 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('event-state-overlapping.png', {
      animations: 'disabled',
    });
  });

  test('알림과 반복이 모두 있는 일정', async ({ page }) => {
    /**
     * 목적: 여러 상태가 동시에 표시되는 일정
     */
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    await page.getByLabel('제목').fill('복합 상태 일정');
    await page.getByLabel('날짜').fill(dateStr);
    await page.getByLabel('시작 시간').fill('23:00');
    await page.getByLabel('종료 시간').fill('23:30');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '10분 전' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 복합 상태 일정 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('event-state-complex.png', {
      animations: 'disabled',
    });
  });

  test('삭제 버튼 호버 상태', async ({ page }) => {
    /**
     * 목적: 일정의 삭제 버튼에 호버 시 시각적 변화
     */
    // 일정 생성
    await page.getByLabel('제목').fill('호버 테스트 일정');
    await page.getByLabel('날짜').fill('2025-10-21');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트에서 삭제 버튼에 호버
    const eventList = page.getByTestId('event-list');
    const deleteButton = eventList.locator('li').filter({ hasText: '호버 테스트 일정' }).getByRole('button', { name: '삭제' });
    await deleteButton.hover();

    // 호버 상태 스크린샷
    await expect(eventList).toHaveScreenshot('event-state-delete-hover.png', {
      animations: 'disabled',
    });
  });
});
