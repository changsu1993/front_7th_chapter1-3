import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * EventListPage
 * 일정 목록 관련 상호작용
 */
export class EventListPage extends BasePage {
  // Selectors
  readonly eventList = () => this.page.getByTestId('event-list');
  readonly searchInput = () => this.page.getByLabel('일정 검색');

  constructor(page: Page) {
    super(page);
  }

  /**
   * 제목으로 일정 찾기
   */
  private getEventByTitle(title: string): Locator {
    return this.eventList().getByText(title).first();
  }

  /**
   * 제목으로 일정 클릭 (편집 모드 진입)
   */
  async clickEventByTitle(title: string): Promise<void> {
    await this.getEventByTitle(title).click();
  }

  /**
   * 일정 목록에 제목이 있는지 확인
   */
  async hasEventWithTitle(title: string): Promise<boolean> {
    try {
      await this.getEventByTitle(title).waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 일정 목록에서 일정 삭제 (제목으로 찾기)
   */
  async deleteEventByTitle(title: string): Promise<void> {
    // Dialog 제거 (있을 수 있음)
    await this.clearDialogOverlays();

    const event = this.eventList().locator('li').filter({ hasText: title }).first();
    const deleteButton = event.getByRole('button', { name: '삭제' });

    // 삭제 버튼이 클릭 가능할 때까지 대기
    await deleteButton.waitFor({ timeout: 3000 });

    // force: true로 Dialog 차단 무시하고 클릭
    await deleteButton.click({ force: true, timeout: 2000 });
  }

  /**
   * Dialog/Modal 오버레이 정리
   */
  private async clearDialogOverlays(): Promise<void> {
    await this.page.evaluate(() => {
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

      // body overflow 복구
      document.body.style.overflow = 'auto';
    });

    await this.page.waitForTimeout(100);
  }

  /**
   * 검색 입력
   */
  async search(searchTerm: string): Promise<void> {
    await this.searchInput().fill(searchTerm);
  }

  /**
   * 검색 입력 초기화 (검색어 삭제)
   */
  async clearSearch(): Promise<void> {
    await this.searchInput().fill('');
  }

  /**
   * 검색 결과 확인 (결과가 있는지)
   */
  async hasSearchResult(searchTerm: string): Promise<boolean> {
    try {
      await this.eventList()
        .getByText(searchTerm)
        .first()
        .waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 검색 결과 없음 메시지 확인
   */
  async hasNoSearchResult(): Promise<boolean> {
    return await this.hasText('검색 결과가 없습니다');
  }

  /**
   * 일정 목록이 보일 때까지 대기
   */
  async waitForEventList(): Promise<void> {
    await this.waitForElement(this.eventList());
  }

  /**
   * 특정 일정이 보일 때까지 대기
   */
  async waitForEvent(title: string, timeout = 5000): Promise<void> {
    try {
      await this.getEventByTitle(title).waitFor({ timeout });
    } catch {
      throw new Error(`일정 "${title}"을(를) 찾을 수 없습니다`);
    }
  }

  /**
   * 특정 일정이 사라질 때까지 대기 (삭제 후)
   */
  async waitForEventToDisappear(title: string, timeout = 5000): Promise<void> {
    try {
      await this.getEventByTitle(title).waitFor({ state: 'hidden', timeout });
    } catch {
      throw new Error(`일정 "${title}"이(가) 여전히 목록에 있습니다`);
    }
  }

  /**
   * 일정 목록의 모든 일정 개수 반환
   */
  async getEventCount(): Promise<number> {
    const events = await this.eventList().locator('li').count();
    return events;
  }

  /**
   * 일정이 특정 텍스트를 포함하는지 확인
   */
  async eventContainsText(eventTitle: string, text: string): Promise<boolean> {
    const event = this.eventList().filter({ hasText: eventTitle }).first();
    const content = await event.textContent();
    return content ? content.includes(text) : false;
  }
}
