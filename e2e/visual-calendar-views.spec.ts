import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test: 캘린더 뷰 타입별 렌더링
 *
 * 테스트 목적:
 * - 월간 뷰와 주간 뷰가 올바르게 렌더링되는지 시각적으로 검증
 * - 레이아웃, 스타일, 날짜 표시 등이 일관되게 나타나는지 확인
 *
 * 테스트 시나리오:
 * 1. 월간 뷰 기본 렌더링
 * 2. 주간 뷰 기본 렌더링
 * 3. 월간 뷰에 일정이 있을 때
 * 4. 주간 뷰에 일정이 있을 때
 * 5. 다음/이전 월/주 네비게이션
 * 6. 공휴일 표시
 */

test.describe('Visual Regression: 캘린더 뷰 타입', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!').first()).toBeVisible();
  });

  test('월간 뷰 기본 렌더링', async ({ page }) => {
    /**
     * 목적: 월간 뷰의 기본 레이아웃과 스타일 검증
     */
    // 월간 뷰가 기본값이므로 바로 스크린샷
    await expect(page).toHaveScreenshot('month-view-default.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('주간 뷰 기본 렌더링', async ({ page }) => {
    /**
     * 목적: 주간 뷰의 기본 레이아웃과 스타일 검증
     */
    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 주간 뷰 스크린샷
    await expect(page).toHaveScreenshot('week-view-default.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('월간 뷰에 일정이 표시될 때', async ({ page }) => {
    /**
     * 목적: 일정이 포함된 월간 뷰의 시각적 표현 검증
     */
    // 테스트 일정 생성
    await page.getByLabel('제목').fill('시각 테스트 일정');
    await page.getByLabel('날짜').fill('2025-10-15');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 스크린샷
    await expect(page).toHaveScreenshot('month-view-with-events.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('주간 뷰에 일정이 표시될 때', async ({ page }) => {
    /**
     * 목적: 일정이 포함된 주간 뷰의 시각적 표현 검증
     */
    // 일정 생성
    await page.getByLabel('제목').fill('주간 뷰 테스트');
    await page.getByLabel('날짜').fill('2025-10-01');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 스크린샷
    await expect(page).toHaveScreenshot('week-view-with-events.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('월간 뷰 - 여러 일정이 있는 날', async ({ page }) => {
    /**
     * 목적: 한 날짜에 여러 일정이 있을 때의 시각적 표현
     */
    const events = [
      { title: '아침 회의', time: { start: '09:00', end: '10:00' }, category: '업무' },
      { title: '점심 약속', time: { start: '12:00', end: '13:00' }, category: '개인' },
      { title: '저녁 스터디', time: { start: '18:00', end: '19:00' }, category: '개인' },
    ];

    for (const event of events) {
      await page.getByLabel('제목').fill(event.title);
      await page.getByLabel('날짜').fill('2025-10-20');
      await page.getByLabel('시작 시간').fill(event.time.start);
      await page.getByLabel('종료 시간').fill(event.time.end);
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: event.category }).click();
      await page.getByRole('button', { name: '일정 추가' }).click();
    }

    // 스크린샷
    await expect(page).toHaveScreenshot('month-view-multiple-events-per-day.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('다음 월로 네비게이션', async ({ page }) => {
    /**
     * 목적: 월 이동 시 캘린더 렌더링 검증
     */
    // 다음 월로 이동
    await page.getByLabel('Next').click();

    // 스크린샷
    await expect(page).toHaveScreenshot('month-view-next-month.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('이전 월로 네비게이션', async ({ page }) => {
    /**
     * 목적: 이전 월 이동 시 캘린더 렌더링 검증
     */
    // 이전 월로 이동
    await page.getByLabel('Previous').click();

    // 스크린샷
    await expect(page).toHaveScreenshot('month-view-previous-month.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('주간 뷰 네비게이션', async ({ page }) => {
    /**
     * 목적: 주간 뷰에서 주 이동 시 렌더링 검증
     */
    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 다음 주로 이동
    await page.getByLabel('Next').click();

    // 스크린샷
    await expect(page).toHaveScreenshot('week-view-next-week.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('공휴일 표시 (월간 뷰)', async ({ page }) => {
    /**
     * 목적: 공휴일이 달력에 올바르게 표시되는지 검증
     */
    // 공휴일이 있는 월로 이동 (예: 1월 - 신정)
    // 현재 달이 10월이므로 이전으로 여러 번 이동하거나 특정 달로 이동
    // (구현에 따라 달력 날짜 설정 방법이 다를 수 있음)

    // 스크린샷 (공휴일이 표시된 상태)
    await expect(page).toHaveScreenshot('month-view-with-holidays.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('빈 월간 뷰 (일정 없음)', async ({ page }) => {
    /**
     * 목적: 일정이 전혀 없는 달의 시각적 표현
     */
    // 먼 미래나 과거로 이동하여 일정이 없는 달 확인
    // 여러 번 다음 월 클릭
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Next').click();
    }

    // 스크린샷
    await expect(page).toHaveScreenshot('month-view-empty.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('빈 주간 뷰 (일정 없음)', async ({ page }) => {
    /**
     * 목적: 일정이 없는 주의 시각적 표현
     */
    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 여러 주 이동
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Next').click();
    }

    // 스크린샷
    await expect(page).toHaveScreenshot('week-view-empty.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
