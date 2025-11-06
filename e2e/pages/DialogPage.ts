import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DialogPage
 * 다이얼로그 관련 상호작용 (겹침 경고, 반복 일정 수정/삭제)
 */
export class DialogPage extends BasePage {
  // Selectors
  readonly overlapWarningDialog = () => this.page.getByRole('dialog').filter({ hasText: '일정 겹침' });
  readonly recurringDialog = () => this.page.getByRole('dialog').filter({ hasText: '반복' });
  readonly continueButton = () => this.page.getByRole('button', { name: '계속' });
  readonly cancelButton = () => this.page.getByRole('button', { name: '취소' });
  readonly singleInstanceButton = () => this.page.getByRole('button', { name: /이 일정만|이 일정만만/ });
  readonly allInstancesButton = () => this.page.getByRole('button', { name: /모든 일정|전체 반복/ });

  constructor(page: Page) {
    super(page);
  }

  /**
   * 겹침 경고 다이얼로그 보임 확인
   */
  async hasOverlapWarning(): Promise<boolean> {
    try {
      await this.overlapWarningDialog().waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 반복 일정 다이얼로그 보임 확인
   */
  async hasRecurringDialog(): Promise<boolean> {
    try {
      await this.recurringDialog().waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 겹침 경고 무시 후 계속
   */
  async continueWithOverlapWarning(): Promise<void> {
    if (await this.hasOverlapWarning()) {
      await this.clickButton('계속');
    }
  }

  /**
   * 겹침 경고 취소
   */
  async cancelOverlapWarning(): Promise<void> {
    if (await this.hasOverlapWarning()) {
      await this.clickButton('취소');
    }
  }

  /**
   * 반복 일정 - 이 일정만 선택
   */
  async selectSingleInstance(): Promise<void> {
    if (await this.hasRecurringDialog()) {
      // "이 일정만" 또는 유사한 텍스트의 버튼 클릭
      await this.page
        .getByRole('dialog')
        .getByRole('button')
        .filter({ hasText: /이 일정만|단일 인스턴스/ })
        .first()
        .click();
    }
  }

  /**
   * 반복 일정 - 모든 일정 선택
   */
  async selectAllInstances(): Promise<void> {
    if (await this.hasRecurringDialog()) {
      // "모든 일정" 또는 유사한 텍스트의 버튼 클릭
      await this.page
        .getByRole('dialog')
        .getByRole('button')
        .filter({ hasText: /모든 일정|전체 반복/ })
        .first()
        .click();
    }
  }

  /**
   * 다이얼로그 취소
   */
  async closeDialog(): Promise<void> {
    const cancelBtn = this.page
      .getByRole('dialog')
      .getByRole('button')
      .filter({ hasText: '취소' })
      .first();

    try {
      await cancelBtn.click();
    } catch {
      // 다이얼로그가 없을 수 있음
    }
  }

  /**
   * 다이얼로그가 닫힐 때까지 대기
   */
  async waitForDialogToClosed(timeout = 5000): Promise<void> {
    try {
      await this.page.getByRole('dialog').waitFor({ state: 'hidden', timeout });
    } catch {
      // 다이얼로그가 없을 수 있음
    }
  }

  /**
   * 다이얼로그 제목 확인
   */
  async getDialogTitle(): Promise<string | null> {
    try {
      const title = await this.page
        .getByRole('dialog')
        .locator('h2, h3')
        .first()
        .textContent();
      return title;
    } catch {
      return null;
    }
  }

  /**
   * 다이얼로그 내용 텍스트 확인
   */
  async getDialogContent(): Promise<string | null> {
    try {
      const content = await this.page.getByRole('dialog').textContent();
      return content;
    } catch {
      return null;
    }
  }

  /**
   * 특정 버튼이 다이얼로그에 있는지 확인
   */
  async hasButton(buttonText: string): Promise<boolean> {
    try {
      await this.page
        .getByRole('dialog')
        .getByRole('button', { name: buttonText })
        .waitFor({ timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 다이얼로그 버튼 클릭
   */
  async clickDialogButton(buttonText: string): Promise<void> {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: buttonText })
      .click();
  }
}
