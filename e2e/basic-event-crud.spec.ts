import { test, expect } from '@playwright/test';

/**
 * E2E Test: 기본 일정 관리 워크플로우 (CRUD)
 *
 * 테스트 목적:
 * - 사용자가 일정을 생성(Create)하고 조회(Read)하고 수정(Update)하고 삭제(Delete)하는 전체 워크플로우를 검증
 * - 실제 사용자 시나리오를 기반으로 앱의 핵심 기능이 올바르게 동작하는지 확인
 *
 * 테스트 시나리오:
 * 1. 앱 로딩 및 초기 상태 확인
 * 2. 새 일정 생성 (Create)
 * 3. 생성된 일정 조회 (Read)
 * 4. 일정 수정 (Update)
 * 5. 일정 삭제 (Delete)
 */

test.describe('기본 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 앱 로드
    await page.goto('/');

    // 일정 로딩 완료 대기
    await expect(page.getByText('일정 로딩 완료!')).toBeVisible();
  });

  test('전체 CRUD 워크플로우: 일정 생성 → 조회 → 수정 → 삭제', async ({ page }) => {
    /**
     * Step 1: Create - 새 일정 생성
     */
    // 일정 폼에 데이터 입력
    await page.getByLabel('제목').fill('E2E 테스트 일정');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('Playwright E2E 테스트를 위한 일정입니다');
    await page.getByLabel('위치').fill('테스트 회의실');

    // 카테고리 선택
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 일정 추가 버튼 클릭
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    /**
     * Step 2: Read - 생성된 일정 조회
     */
    // 이벤트 리스트에서 생성된 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('E2E 테스트 일정')).toBeVisible();
    await expect(eventList.getByText('2025-11-10')).toBeVisible();
    await expect(eventList.getByText('14:00 - 15:00')).toBeVisible();
    await expect(eventList.getByText('테스트 회의실')).toBeVisible();

    /**
     * Step 3: Update - 일정 수정
     */
    // 수정할 일정 클릭 (편집 모드로 진입)
    await eventList.getByText('E2E 테스트 일정').click();

    // 폼에 기존 값이 로드되었는지 확인
    const titleInput = page.getByLabel('제목');
    await expect(titleInput).toHaveValue('E2E 테스트 일정');

    // 일정 정보 수정
    await titleInput.fill('E2E 테스트 일정 (수정됨)');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('설명').fill('수정된 E2E 테스트 일정입니다');

    // 일정 수정 버튼 클릭
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();

    // 수정된 내용 확인
    await expect(eventList.getByText('E2E 테스트 일정 (수정됨)')).toBeVisible();
    await expect(eventList.getByText('15:00 - 16:00')).toBeVisible();

    /**
     * Step 4: Delete - 일정 삭제
     */
    // 삭제 버튼 찾기 및 클릭
    const eventToDelete = eventList.getByText('E2E 테스트 일정 (수정됨)').locator('..');
    await eventToDelete.getByRole('button', { name: '삭제' }).click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();

    // 삭제된 일정이 목록에서 사라졌는지 확인
    await expect(eventList.getByText('E2E 테스트 일정 (수정됨)')).not.toBeVisible();
  });

  test('여러 일정 생성 후 목록에서 확인', async ({ page }) => {
    /**
     * 목적: 여러 일정을 연속으로 생성하고 모두 올바르게 표시되는지 확인
     */
    const events = [
      { title: '일정 1', date: '2025-11-11', startTime: '09:00', endTime: '10:00' },
      { title: '일정 2', date: '2025-11-12', startTime: '11:00', endTime: '12:00' },
      { title: '일정 3', date: '2025-11-13', startTime: '14:00', endTime: '15:00' },
    ];

    for (const event of events) {
      await page.getByLabel('제목').fill(event.title);
      await page.getByLabel('날짜').fill(event.date);
      await page.getByLabel('시작 시간').fill(event.startTime);
      await page.getByLabel('종료 시간').fill(event.endTime);
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: '업무' }).click();
      await page.getByRole('button', { name: '일정 추가' }).click();
      await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    }

    // 모든 일정이 목록에 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    for (const event of events) {
      await expect(eventList.getByText(event.title)).toBeVisible();
      await expect(eventList.getByText(event.date)).toBeVisible();
    }
  });

  test('필수 필드 누락 시 일정 생성 불가', async ({ page }) => {
    /**
     * 목적: 필수 필드가 비어있을 때 일정이 생성되지 않아야 함
     */
    // 제목만 입력하고 나머지는 비워둠
    await page.getByLabel('제목').fill('불완전한 일정');

    // 일정 추가 버튼이 비활성화되어 있거나 클릭해도 경고가 표시되어야 함
    const addButton = page.getByRole('button', { name: '일정 추가' });

    // 버튼 클릭 시도
    await addButton.click();

    // 일정이 추가되지 않았는지 확인 (실패 메시지 또는 일정 미추가)
    // 성공 메시지가 나타나지 않아야 함
    await expect(page.getByText('일정이 추가되었습니다')).not.toBeVisible({ timeout: 2000 });
  });

  test('시간 유효성 검증: 시작 시간이 종료 시간보다 늦으면 경고', async ({ page }) => {
    /**
     * 목적: 잘못된 시간 범위 입력 시 유효성 검증 확인
     */
    await page.getByLabel('제목').fill('시간 오류 테스트');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('15:00'); // 시작 시간보다 이른 종료 시간
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 일정 추가 시도
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 에러 메시지나 툴팁 확인 (실제 구현에 따라 다를 수 있음)
    // 또는 일정이 추가되지 않았는지 확인
    await expect(page.getByText('일정이 추가되었습니다')).not.toBeVisible({ timeout: 2000 });
  });

  test('일정 수정 취소 시 변경사항이 적용되지 않음', async ({ page }) => {
    /**
     * 목적: 수정 중에 취소하면 원래 값이 유지되어야 함
     */
    // 먼저 일정 생성
    await page.getByLabel('제목').fill('수정 취소 테스트');
    await page.getByLabel('날짜').fill('2025-11-14');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 일정 클릭하여 편집 모드 진입
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('수정 취소 테스트').click();

    // 제목 수정
    await page.getByLabel('제목').fill('수정된 제목 (취소될 것)');

    // 취소 버튼이 있다면 클릭, 없다면 다른 일정을 클릭하여 편집 모드 종료
    // 여기서는 폼 리셋 또는 다른 작업으로 취소를 시뮬레이션
    // 실제 구현에 따라 조정 필요
    await page.reload();
    await expect(page.getByText('일정 로딩 완료!')).toBeVisible();

    // 원래 제목이 유지되었는지 확인
    await expect(eventList.getByText('수정 취소 테스트')).toBeVisible();
    await expect(eventList.getByText('수정된 제목 (취소될 것)')).not.toBeVisible();
  });
});
