import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test: 폼 컨트롤 상태
 *
 * 테스트 목적:
 * - 폼 입력 필드의 다양한 상태가 시각적으로 올바르게 표현되는지 검증
 * - 포커스, 에러, 비활성화, 채워진 상태 등의 스타일 일관성 확인
 *
 * 테스트 시나리오:
 * 1. 빈 폼 (기본 상태)
 * 2. 포커스된 입력 필드
 * 3. 채워진 폼
 * 4. 에러 상태 (시간 유효성 검증 실패)
 * 5. 드롭다운 (카테고리, 반복 유형, 알림)
 * 6. 일정 수정 모드 (폼에 기존 데이터 로드)
 */

test.describe('Visual Regression: 폼 컨트롤 상태', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!').first()).toBeVisible();
  });

  test('빈 폼 - 기본 상태', async ({ page }) => {
    /**
     * 목적: 초기 상태의 폼 시각적 표현
     */
    // 폼 영역 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-empty-state.png', {
      animations: 'disabled',
    });
  });

  test('포커스된 입력 필드', async ({ page }) => {
    /**
     * 목적: 입력 필드에 포커스가 있을 때 시각적 변화
     */
    // 제목 필드에 포커스
    const titleInput = page.getByLabel('제목');
    await titleInput.focus();

    // 폼 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-field-focused.png', {
      animations: 'disabled',
    });
  });

  test('채워진 폼', async ({ page }) => {
    /**
     * 목적: 모든 필드가 채워진 상태의 시각적 표현
     */
    await page.getByLabel('제목').fill('완전히 채워진 일정');
    await page.getByLabel('날짜').fill('2025-11-10');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('상세한 설명 내용입니다');
    await page.getByLabel('위치').fill('회의실 A');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 폼 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-filled-state.png', {
      animations: 'disabled',
    });
  });

  test('시간 유효성 에러 상태', async ({ page }) => {
    /**
     * 목적: 시작 시간이 종료 시간보다 늦을 때 에러 표시
     */
    await page.getByLabel('제목').fill('에러 테스트');
    await page.getByLabel('날짜').fill('2025-11-11');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('15:00'); // 에러: 시작 > 종료

    // 종료 시간 필드 포커스 아웃 (에러 트리거)
    await page.getByLabel('종료 시간').blur();

    // 에러 상태 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-time-validation-error.png', {
      animations: 'disabled',
    });
  });

  test('카테고리 드롭다운 열림 상태', async ({ page }) => {
    /**
     * 목적: 드롭다운 메뉴가 열렸을 때 시각적 표현
     */
    // 카테고리 드롭다운 열기
    await page.getByLabel('카테고리').click();

    // 드롭다운이 열린 상태 대기
    await expect(page.getByRole('option', { name: '업무' })).toBeVisible();

    // 전체 페이지 스크린샷 (드롭다운 포함)
    await expect(page).toHaveScreenshot('form-category-dropdown-open.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('반복 유형 드롭다운 열림 상태', async ({ page }) => {
    /**
     * 목적: 반복 유형 선택 드롭다운
     */
    // 반복 유형 드롭다운 열기
    await page.getByLabel('반복 유형').click();

    // 드롭다운 옵션 대기
    await expect(page.getByRole('option', { name: 'daily' })).toBeVisible();

    // 스크린샷
    await expect(page).toHaveScreenshot('form-repeat-type-dropdown-open.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('알림 설정 드롭다운 열림 상태', async ({ page }) => {
    /**
     * 목적: 알림 시간 선택 드롭다운
     */
    // 알림 설정 드롭다운 열기
    await page.getByLabel('알림 설정').click();

    // 드롭다운 옵션 대기
    await expect(page.getByRole('option', { name: '10분 전' })).toBeVisible();

    // 스크린샷
    await expect(page).toHaveScreenshot('form-notification-dropdown-open.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('일정 수정 모드 - 폼에 기존 데이터 로드', async ({ page }) => {
    /**
     * 목적: 일정 클릭 시 폼에 기존 값이 로드된 상태
     */
    // 먼저 일정 생성
    await page.getByLabel('제목').fill('수정할 일정');
    await page.getByLabel('날짜').fill('2025-11-12');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('설명').fill('원래 설명');
    await page.getByLabel('위치').fill('원래 위치');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 클릭하여 편집 모드 진입
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('수정할 일정').click();

    // 기존 데이터가 로드된 폼 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-edit-mode-loaded.png', {
      animations: 'disabled',
    });
  });

  test('반복 일정 설정이 활성화된 폼', async ({ page }) => {
    /**
     * 목적: 반복 설정 필드들이 모두 채워진 상태
     */
    await page.getByLabel('제목').fill('반복 일정');
    await page.getByLabel('날짜').fill('2025-11-13');
    await page.getByLabel('시작 시간').fill('09:00');
    await page.getByLabel('종료 시간').fill('10:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 반복 설정
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: 'weekly' }).click();
    await page.getByLabel('반복 간격').fill('2');
    await page.getByLabel('반복 종료일').fill('2025-12-31');

    // 폼 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-with-repeat-settings.png', {
      animations: 'disabled',
    });
  });

  test('버튼 상태 - 일정 추가 버튼', async ({ page }) => {
    /**
     * 목적: 일정 추가 버튼의 기본 상태
     */
    const addButton = page.getByRole('button', { name: '일정 추가' });
    await expect(addButton).toBeVisible();

    // 버튼 영역 스크린샷
    await expect(addButton).toHaveScreenshot('button-add-event.png', {
      animations: 'disabled',
    });
  });

  test('버튼 상태 - 일정 수정 버튼 (편집 모드)', async ({ page }) => {
    /**
     * 목적: 편집 모드일 때 버튼이 "일정 수정"으로 변경
     */
    // 일정 생성
    await page.getByLabel('제목').fill('버튼 테스트');
    await page.getByLabel('날짜').fill('2025-11-14');
    await page.getByLabel('시작 시간').fill('11:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 편집 모드 진입
    const eventList = page.getByTestId('event-list');
    await eventList.getByText('버튼 테스트').click();

    // "일정 수정" 버튼 스크린샷
    const updateButton = page.getByRole('button', { name: '일정 수정' });
    await expect(updateButton).toHaveScreenshot('button-update-event.png', {
      animations: 'disabled',
    });
  });

  test('버튼 호버 상태', async ({ page }) => {
    /**
     * 목적: 버튼에 호버 시 시각적 변화
     */
    const addButton = page.getByRole('button', { name: '일정 추가' });
    await addButton.hover();

    // 호버 상태 버튼 스크린샷
    await expect(addButton).toHaveScreenshot('button-add-hover.png', {
      animations: 'disabled',
    });
  });

  test('여러 입력 필드 포커스 순서', async ({ page }) => {
    /**
     * 목적: Tab 키를 통한 포커스 이동 시각화
     */
    // 첫 번째 필드에 포커스
    await page.getByLabel('제목').focus();

    // 제목 필드 포커스 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-focus-title.png', {
      animations: 'disabled',
    });

    // 다음 필드로 Tab 이동
    await page.keyboard.press('Tab');

    // 날짜 필드 포커스 스크린샷
    await expect(form).toHaveScreenshot('form-focus-date.png', {
      animations: 'disabled',
    });
  });

  test('긴 텍스트 입력 시 필드 표시', async ({ page }) => {
    /**
     * 목적: 긴 텍스트가 입력되었을 때 필드 처리
     */
    const longText = '이것은 매우 긴 제목입니다. '.repeat(10);
    await page.getByLabel('제목').fill(longText);

    // 긴 텍스트가 있는 폼 스크린샷
    const form = page.locator('form');
    await expect(form).toHaveScreenshot('form-long-text-input.png', {
      animations: 'disabled',
    });
  });
});
