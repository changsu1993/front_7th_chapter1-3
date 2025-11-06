import { Page } from '@playwright/test';

/**
 * AppTestContext
 *
 * 모든 E2E 테스트의 공통 setup/cleanup을 담당하는 컨텍스트 클래스
 * - Dialog 완전 정리
 * - 앱 상태 초기화
 * - API를 통한 데이터 정리
 */
export class AppTestContext {
  private page: Page;
  private isInitialized = false;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 앱 초기화: 앱 로드 및 상태 정리
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 앱 로드
    await this.page.goto('/');

    // 동적 대기: 이벤트 로딩 대기
    await this.waitForAppReady();

    // Dialog 완전 정리
    await this.clearAllDialogs();

    // 포커스 복구
    await this.resetFocus();

    this.isInitialized = true;
  }

  /**
   * 앱 준비 대기 (동적 대기)
   */
  private async waitForAppReady(): Promise<void> {
    try {
      // 네트워크가 안정될 때까지 대기
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      // 네트워크가 안정되지 않으면 로딩 메시지로 확인
      await this.page.getByText('일정 로딩 완료!').first().waitFor({ timeout: 5000 });
    }
  }

  /**
   * 모든 Dialog 정리 (React 상태 + DOM)
   */
  private async clearAllDialogs(): Promise<void> {
    await this.page.evaluate(() => {
      // React 상태 초기화 (App.tsx에서 노출된 함수)
      const resetDialogs = (window as any).__resetDialogStates__;
      if (resetDialogs && typeof resetDialogs === 'function') {
        resetDialogs();
      }

      // MUI Dialog 제거
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach((dialog) => {
        const root = dialog.closest('.MuiModal-root');
        if (root) {
          root.remove();
        }
      });

      // Backdrop 제거
      const backdrops = document.querySelectorAll('[role="presentation"]');
      backdrops.forEach((backdrop) => {
        const parent = backdrop.parentElement;
        if (parent && parent.classList.contains('MuiBackdrop-root')) {
          parent.remove();
        }
      });

      // body의 overflow 스타일 복구
      document.body.style.overflow = 'auto';
    });

    // 약간의 지연 (DOM 업데이트 반영)
    await this.page.waitForTimeout(200);
  }

  /**
   * 포커스 초기화
   */
  private async resetFocus(): Promise<void> {
    await this.page.evaluate(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
    });
  }

  /**
   * 앱 정리: 생성된 모든 데이터 삭제
   */
  async cleanup(): Promise<void> {
    try {
      // API를 통한 모든 일정 삭제
      await this.deleteAllEventsViaAPI();
    } catch (error) {
      console.warn('Cleanup 중 에러 발생:', error);
    }

    this.isInitialized = false;
  }

  /**
   * API를 통한 모든 일정 삭제
   */
  private async deleteAllEventsViaAPI(): Promise<void> {
    const response = await this.page.request.get('/api/events');
    if (!response.ok()) {
      console.warn('이벤트 조회 실패');
      return;
    }

    const events = await response.json();
    if (!Array.isArray(events)) {
      return;
    }

    // 모든 일정 삭제
    for (const event of events) {
      await this.page.request.delete(`/api/events/${event.id}`);
    }
  }

  /**
   * UI를 통한 일정 생성 (느림, 사용자 시뮬레이션)
   */
  async createEventViaUI(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
  }): Promise<void> {
    await this.page.getByLabel('제목').fill(eventData.title);
    await this.page.getByLabel('날짜').fill(eventData.date);
    await this.page.getByLabel('시작 시간').fill(eventData.startTime);
    await this.page.getByLabel('종료 시간').fill(eventData.endTime);

    if (eventData.description) {
      await this.page.getByLabel('설명').fill(eventData.description);
    }

    if (eventData.location) {
      await this.page.getByLabel('위치').fill(eventData.location);
    }

    if (eventData.category) {
      await this.page.getByLabel('카테고리').click();
      await this.page.getByRole('option', { name: eventData.category }).click();
    }

    await this.page.getByRole('button', { name: '일정 추가' }).click();

    // 일정이 추가될 때까지 대기
    await this.page.waitForTimeout(300);
  }

  /**
   * API를 통한 일정 생성 (빠름, 직접 API 호출)
   */
  async createEventViaAPI(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    repeat?: {
      type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      endDate?: string;
    };
    notification?: number;
  }): Promise<any> {
    const event = {
      title: eventData.title,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description || '',
      location: eventData.location || '',
      category: eventData.category || '기타',
      repeat: eventData.repeat || { type: 'none', interval: 0 },
      notification: eventData.notification || 0,
      id: Date.now().toString(), // 임시 ID (서버에서 생성)
    };

    const response = await this.page.request.post('/api/events', {
      data: event,
    });

    if (!response.ok()) {
      throw new Error(`일정 생성 실패: ${response.status()}`);
    }

    return await response.json();
  }

  /**
   * Page 객체 접근 (필요시)
   */
  getPage(): Page {
    return this.page;
  }
}
