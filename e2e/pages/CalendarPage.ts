import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CalendarPage
 * 캘린더 관련 상호작용 (뷰 전환, 네비게이션)
 */
export class CalendarPage extends BasePage {
  // Selectors
  readonly monthViewButton = () => this.page.getByLabel('뷰 타입 선택');
  readonly previousMonthButton = () => this.page.getByRole('button', { name: /이전|</ }).first();
  readonly nextMonthButton = () => this.page.getByRole('button', { name: /다음|>/ }).first();
  readonly currentMonthDisplay = () => this.page.locator('[data-testid="current-month"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * 월간 뷰로 전환
   */
  async switchToMonthView(): Promise<void> {
    const viewButton = this.monthViewButton();
    await viewButton.click();
    await this.selectOption('month-option');
  }

  /**
   * 주간 뷰로 전환
   */
  async switchToWeekView(): Promise<void> {
    const viewButton = this.monthViewButton();
    await viewButton.click();
    await this.selectOption('week-option');
  }

  /**
   * 이전 달/주로 이동
   */
  async goToPrevious(): Promise<void> {
    await this.previousMonthButton().click();
  }

  /**
   * 다음 달/주로 이동
   */
  async goToNext(): Promise<void> {
    await this.nextMonthButton().click();
  }

  /**
   * 특정 날짜 셀 가져오기 (드래그 앤 드롭용)
   */
  async getDateCell(dateString: string): Promise<any> {
    // 날짜 셀은 캘린더 구조에 따라 다름
    return this.page.locator(`[data-date="${dateString}"]`).first();
  }

  /**
   * 특정 날짜 셀에 드래그 (일정 이동용)
   */
  async dragEventToDate(eventLocator: any, targetDateString: string): Promise<void> {
    const dateCell = await this.getDateCell(targetDateString);
    await eventLocator.dragTo(dateCell);
  }

  /**
   * 캘린더가 준비될 때까지 대기
   */
  async waitForCalendar(): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      await this.waitForText('일정 로딩 완료!');
    }
  }

  /**
   * 현재 표시되는 월/주 가져오기
   */
  async getCurrentDateDisplay(): Promise<string | null> {
    try {
      const text = await this.currentMonthDisplay().textContent();
      return text;
    } catch {
      return null;
    }
  }

  /**
   * 특정 날짜의 셀에 일정이 표시되어 있는지 확인
   */
  async hasEventOnDate(dateString: string, eventTitle: string): Promise<boolean> {
    try {
      const dateCell = await this.getDateCell(dateString);
      const hasEvent = await dateCell.getByText(eventTitle).isVisible();
      return hasEvent;
    } catch {
      return false;
    }
  }

  /**
   * 캘린더 셀에 이벤트 생성 (드롭-인 클릭으로 폼 열기)
   */
  async clickOnDateCell(dateString: string): Promise<void> {
    const dateCell = await this.getDateCell(dateString);
    await dateCell.click();
  }

  /**
   * 캘린더 스크린샷 (시각 테스트용)
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png` });
  }
}
