import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test: 텍스트 오버플로우 처리
 *
 * 테스트 목적:
 * - 긴 텍스트가 UI 요소에서 올바르게 처리되는지 시각적으로 검증
 * - 말줄임(...), 줄바꿈, 스크롤 등 오버플로우 처리 방식 확인
 *
 * 테스트 시나리오:
 * 1. 캘린더 셀에 긴 제목의 일정
 * 2. 일정 리스트에 긴 제목
 * 3. 긴 설명 텍스트
 * 4. 긴 위치 정보
 * 5. 여러 일정이 있는 셀 (공간 제약)
 * 6. 주간 뷰 vs 월간 뷰에서의 텍스트 처리
 */

test.describe('Visual Regression: 텍스트 오버플로우 처리', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('일정 로딩 완료!').first()).toBeVisible();
  });

  test('캘린더 셀에 매우 긴 제목의 일정', async ({ page }) => {
    /**
     * 목적: 캘린더 셀에서 긴 제목이 잘리거나 줄바꿈되는지 확인
     */
    const longTitle =
      '이것은 매우 매우 매우 긴 일정 제목입니다 텍스트가 너무 길어서 한 줄에 다 들어가지 않을 수 있습니다';

    await page.getByLabel('제목').fill(longTitle);
    await page.getByLabel('날짜').fill('2025-10-15');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 월간 뷰에서 텍스트 오버플로우 확인
    await expect(page).toHaveScreenshot('text-overflow-calendar-cell-long-title.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('일정 리스트에 긴 제목', async ({ page }) => {
    /**
     * 목적: 일정 리스트에서 긴 제목 처리
     */
    const longTitle = '일정 리스트에 표시될 매우 긴 제목 ' + 'x'.repeat(100);

    await page.getByLabel('제목').fill(longTitle);
    await page.getByLabel('날짜').fill('2025-11-15');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트 영역 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-event-list-long-title.png', {
      animations: 'disabled',
    });
  });

  test('매우 긴 설명 텍스트', async ({ page }) => {
    /**
     * 목적: 설명 필드의 긴 텍스트 처리
     */
    const longDescription = '이것은 매우 긴 설명입니다. '.repeat(50);

    await page.getByLabel('제목').fill('긴 설명 테스트');
    await page.getByLabel('날짜').fill('2025-11-16');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('설명').fill(longDescription);
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트에서 설명이 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-long-description.png', {
      animations: 'disabled',
    });
  });

  test('매우 긴 위치 정보', async ({ page }) => {
    /**
     * 목적: 위치 필드의 긴 텍스트 처리
     */
    const longLocation =
      '서울특별시 강남구 테헤란로 123번길 45-67 OO빌딩 8층 회의실 A호실 옆 복도 끝 왼쪽';

    await page.getByLabel('제목').fill('긴 위치 테스트');
    await page.getByLabel('날짜').fill('2025-11-17');
    await page.getByLabel('시작 시간').fill('13:00');
    await page.getByLabel('종료 시간').fill('14:00');
    await page.getByLabel('위치').fill(longLocation);
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-long-location.png', {
      animations: 'disabled',
    });
  });

  test('한 날짜에 여러 긴 제목 일정들', async ({ page }) => {
    /**
     * 목적: 여러 긴 제목 일정이 한 셀에 있을 때 처리
     */
    const longEvents = [
      '첫 번째 매우 긴 일정 제목입니다 공간이 부족할 수 있습니다',
      '두 번째 매우 긴 일정 제목입니다 역시 공간이 제한적입니다',
      '세 번째 매우 긴 일정 제목입니다 캘린더 셀이 작을 수 있습니다',
    ];

    for (let i = 0; i < longEvents.length; i++) {
      await page.getByLabel('제목').fill(longEvents[i]);
      await page.getByLabel('날짜').fill('2025-10-20');
      await page.getByLabel('시작 시간').fill(`${10 + i}:00`);
      await page.getByLabel('종료 시간').fill(`${11 + i}:00`);
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: '업무' }).click();
      await page.getByRole('button', { name: '일정 추가' }).click();
    }

    // 월간 뷰에서 해당 날짜 셀 확인
    await expect(page).toHaveScreenshot('text-overflow-multiple-long-events-in-cell.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('주간 뷰에서 긴 제목 처리', async ({ page }) => {
    /**
     * 목적: 주간 뷰에서 긴 제목이 어떻게 표시되는지 확인
     */
    const longTitle = '주간 뷰에서의 긴 제목 처리 테스트입니다 공간이 제한적일 수 있습니다';

    await page.getByLabel('제목').fill(longTitle);
    await page.getByLabel('날짜').fill('2025-10-01');
    await page.getByLabel('시작 시간').fill('15:00');
    await page.getByLabel('종료 시간').fill('16:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();

    // 주간 뷰 스크린샷
    await expect(page).toHaveScreenshot('text-overflow-week-view-long-title.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('특수문자와 이모지가 포함된 긴 제목', async ({ page }) => {
    /**
     * 목적: 특수문자와 이모지가 섞인 긴 텍스트 처리
     */
    const titleWithSpecialChars =
      '회의 📅 (긴급) 🔥 @참석자들 #프로젝트A & 프로젝트B 관련 논의 사항 100% 중요!!!';

    await page.getByLabel('제목').fill(titleWithSpecialChars);
    await page.getByLabel('날짜').fill('2025-11-18');
    await page.getByLabel('시작 시간').fill('11:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-special-chars-emojis.png', {
      animations: 'disabled',
    });
  });

  test('영문 긴 단어 (단어 분리 없음)', async ({ page }) => {
    /**
     * 목적: 공백 없이 긴 영문 단어가 줄바꿈되는지 확인
     */
    const longWord = 'VeryLongEventTitleWithoutSpacesAndHyphensThisShouldBreakProperlyInTheUI';

    await page.getByLabel('제목').fill(longWord);
    await page.getByLabel('날짜').fill('2025-11-19');
    await page.getByLabel('시작 시간').fill('16:00');
    await page.getByLabel('종료 시간').fill('17:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-long-word-no-space.png', {
      animations: 'disabled',
    });
  });

  test('숫자와 기호가 많은 제목', async ({ page }) => {
    /**
     * 목적: 숫자와 기호가 많을 때 텍스트 처리
     */
    const numericTitle =
      '2025-11-20 14:00~15:00 회의 (Room#123) - Project-456 ver.7.8.9 @location_A';

    await page.getByLabel('제목').fill(numericTitle);
    await page.getByLabel('날짜').fill('2025-11-20');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정 리스트 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-numeric-symbols.png', {
      animations: 'disabled',
    });
  });

  test('캘린더 셀 크기 변화에 따른 텍스트 처리', async ({ page }) => {
    /**
     * 목적: 다양한 길이의 제목이 캘린더에서 일관되게 처리되는지 확인
     */
    const titles = [
      '짧은제목',
      '중간 길이의 일정 제목입니다',
      '매우 매우 매우 긴 일정 제목으로 텍스트 오버플로우를 테스트합니다 여러 줄로 표시될 수 있습니다',
    ];

    for (let i = 0; i < titles.length; i++) {
      await page.getByLabel('제목').fill(titles[i]);
      await page.getByLabel('날짜').fill('2025-10-25');
      await page.getByLabel('시작 시간').fill(`${9 + i}:00`);
      await page.getByLabel('종료 시간').fill(`${10 + i}:00`);
      await page.getByLabel('카테고리').click();
      await page.getByRole('option', { name: i % 2 === 0 ? '업무' : '개인' }).click();
      await page.getByRole('button', { name: '일정 추가' }).click();
    }

    // 월간 뷰에서 다양한 길이 제목들 확인
    await expect(page).toHaveScreenshot('text-overflow-various-lengths.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('검색 결과에서 긴 텍스트 하이라이트', async ({ page }) => {
    /**
     * 목적: 검색 시 긴 텍스트에서 검색어가 하이라이트되는지 확인
     */
    const longTitle =
      '이것은 매우 긴 제목입니다 중간에 검색어가 포함되어 있으며 텍스트가 매우 길어서 오버플로우가 발생할 수 있습니다';

    await page.getByLabel('제목').fill(longTitle);
    await page.getByLabel('날짜').fill('2025-11-21');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 검색 실행
    const searchInput = page.getByLabel('일정 검색');
    await searchInput.fill('검색어');

    // 검색 결과 스크린샷
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toHaveScreenshot('text-overflow-search-highlight.png', {
      animations: 'disabled',
    });
  });
});
