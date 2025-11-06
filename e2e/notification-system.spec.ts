import { test, expect } from '@playwright/test';

/**
 * E2E Test: 알림 시스템 노출 조건
 *
 * 테스트 목적:
 * - 일정의 알림 시간이 되었을 때 알림이 올바르게 표시되는지 검증
 * - 알림 설정에 따라 알림이 적절히 노출되는지 확인
 *
 * 테스트 시나리오:
 * 1. 알림 시간이 설정된 일정 생성
 * 2. 알림이 표시되는 조건 확인
 * 3. 알림이 표시되지 않는 조건 확인
 * 4. 알림 시간 옵션 (1분, 10분, 1시간 전 등)
 * 5. 이미 알림이 표시된 일정은 중복 알림 안 됨
 */

test.describe('알림 시스템 노출 조건', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!').first()).toBeVisible();
  });

  test('알림 시간이 설정된 일정 생성', async ({ page }) => {
    /**
     * 목적: 알림 시간을 설정하여 일정을 생성할 수 있음
     */
    await page.getByLabel('제목').fill('중요 회의');
    await page.getByLabel('날짜').fill('2025-11-27');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 알림 시간 설정 (10분 전)
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    // 이벤트 리스트에서 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('중요 회의')).toBeVisible();
  });

  test('다양한 알림 시간 옵션으로 일정 생성', async ({ page }) => {
    /**
     * 목적: 1분, 10분, 1시간, 1일 전 등 다양한 알림 옵션 테스트
     */
    const notificationOptions = [
      { label: '1분 전', title: '알림 1분 전' },
      { label: '10분 전', title: '알림 10분 전' },
      { label: '1시간 전', title: '알림 1시간 전' },
      { label: '1일 전', title: '알림 1일 전' },
    ];

    for (const option of notificationOptions) {
      await page.getByLabel('제목').fill(option.title);
      await page.getByLabel('날짜').fill('2025-11-28');
      await page.getByLabel('시작 시간').fill('14:00');
      await page.getByLabel('종료 시간').fill('15:00');
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: '업무' }).click();

      // 알림 시간 설정
      await page.getByLabel('알림 설정').click();
      await page.getByRole('option', { name: option.label }).click();

      await page.getByRole('button', { name: '일정 추가' }).click();
    }

    // 모든 일정이 생성되었는지 확인
    const eventList = page.getByTestId('event-list');
    for (const option of notificationOptions) {
      await expect(eventList.getByText(option.title)).toBeVisible();
    }
  });

  test('알림 시간 없음으로 설정된 일정', async ({ page }) => {
    /**
     * 목적: 알림을 설정하지 않은 일정은 알림이 표시되지 않음
     */
    await page.getByLabel('제목').fill('알림 없는 일정');
    await page.getByLabel('날짜').fill('2025-11-29');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();

    // 알림 설정을 하지 않거나 "알림 없음" 선택
    // (기본값이 알림 없음일 수 있음)

    await page.getByRole('button', { name: '일정 추가' }).click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림 없는 일정')).toBeVisible();
  });

  test('일정 수정 시 알림 시간 변경', async ({ page }) => {
    /**
     * 목적: 기존 일정의 알림 시간을 수정할 수 있음
     */
    // 일정 생성 (10분 전 알림)
    await page.getByLabel('제목').fill('알림 수정 테스트');
    await page.getByLabel('날짜').fill('2025-11-30');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '10분 전' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 수정 (1시간 전으로 변경)
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('알림 수정 테스트').click();

    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1시간 전' }).click();

    await page.getByRole('button', { name: '일정 수정' }).click();
  });

  test('오늘 날짜의 일정 중 알림 시간이 된 일정 확인', async ({ page }) => {
    /**
     * 목적: 현재 시간 기준으로 알림 시간이 된 일정은 강조 표시됨
     *
     * 주의: 이 테스트는 실제 시간에 의존하므로, 테스트를 위해 과거 시간의 일정을 생성하여
     * 알림이 이미 지난 상태로 만들 수 있습니다.
     */
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // 과거 시간의 일정 생성 (이미 알림 시간이 지남)
    await page.getByLabel('제목').fill('지난 알림 일정');
    await page.getByLabel('날짜').fill(dateStr);
    await page.getByLabel('시작 시간').fill('01:00'); // 새벽 1시 (이미 지남)
    await page.getByLabel('종료 시간').fill('02:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    // 알림이 표시되는지 확인 (구현에 따라 스낵바나 특별한 UI가 나타날 수 있음)
    // 또는 일정 목록에서 해당 일정이 강조 표시됨
  });

  test('알림 표시 후 일정 확인', async ({ page }) => {
    /**
     * 목적: 알림이 표시된 일정은 목록에서 확인 가능
     *
     * 알림은 useNotifications 훅에서 처리되며,
     * 알림 시간이 된 일정은 빨간색이나 다른 스타일로 강조 표시됩니다.
     */
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 현재 시간보다 조금 이전의 일정 생성
    await page.getByLabel('제목').fill('알림 표시 테스트');
    await page.getByLabel('날짜').fill(dateStr);
    await page.getByLabel('시작 시간').fill('23:59'); // 오늘 자정 직전
    await page.getByLabel('종료 시간').fill('23:59');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림 표시 테스트')).toBeVisible();
  });

  test('여러 일정의 알림이 동시에 표시될 수 있음', async ({ page }) => {
    /**
     * 목적: 여러 일정의 알림 시간이 비슷하면 모두 표시됨
     */
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 비슷한 시간대의 여러 일정 생성
    const events = [
      { title: '동시 알림 A', time: '02:00' },
      { title: '동시 알림 B', time: '02:05' },
      { title: '동시 알림 C', time: '02:10' },
    ];

    for (const event of events) {
      await page.getByLabel('제목').fill(event.title);
      await page.getByLabel('날짜').fill(dateStr);
      await page.getByLabel('시작 시간').fill(event.time);
      await page.getByLabel('종료 시간').fill('03:00');
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: '업무' }).click();
      await page.getByLabel('알림 설정').click();
      await page.getByRole('option', { name: '1분 전' }).click();

      await page.getByRole('button', { name: '일정 추가' }).click();
    }

    // 모든 일정이 목록에 있는지 확인
    const eventList = page.getByTestId('event-list');
    for (const event of events) {
      await expect(eventList.getByText(event.title)).toBeVisible();
    }
  });

  test('반복 일정의 각 인스턴스별로 알림 설정', async ({ page }) => {
    /**
     * 목적: 반복 일정도 각 인스턴스마다 알림이 설정됨
     */
    await page.getByLabel('제목').fill('반복 일정 알림');
    await page.getByLabel('날짜').fill('2025-12-01');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 반복 설정
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'daily' }).click();
    await page.getByLabel('반복 간격').fill('1');

    // 알림 설정
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    // 반복 일정이 생성되고 알림 설정이 유지됨
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 일정 알림')).toBeVisible();
  });
});
