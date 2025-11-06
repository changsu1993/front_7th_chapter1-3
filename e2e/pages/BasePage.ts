import { Page, Locator } from '@playwright/test';

/**
 * BasePage
 * 모든 Page Object의 기본 클래스
 * 공통 메서드와 상수를 제공합니다.
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 텍스트로 버튼 찾기
   */
  async clickButton(buttonText: string): Promise<void> {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  /**
   * 텍스트로 옵션 선택
   */
  async selectOption(optionText: string): Promise<void> {
    await this.page.getByRole('option', { name: optionText }).click();
  }

  /**
   * 라벨로 입력 필드 채우기
   */
  async fillInput(labelText: string, value: string): Promise<void> {
    await this.page.getByLabel(labelText).fill(value);
  }

  /**
   * 라벨로 드롭다운 선택
   */
  async selectDropdown(labelText: string, optionText: string): Promise<void> {
    // Dialog 완전 정리
    await this.clearDialogOverlays();

    const dropdown = this.page.getByLabel(labelText);

    // 요소가 클릭 가능해질 때까지 대기
    await dropdown.waitFor({ timeout: 3000 });

    // force: true를 사용해서 Dialog 차단을 무시
    await dropdown.click({ force: true, timeout: 2000 });

    // 드롭다운 메뉴가 열릴 때까지 대기
    await this.page.waitForTimeout(300);

    await this.selectOption(optionText);
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
   * 텍스트가 보일 때까지 대기
   */
  async waitForText(text: string, timeout = 5000): Promise<void> {
    await this.page.getByText(text).first().waitFor({ timeout });
  }

  /**
   * 요소가 보일 때까지 대기
   */
  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ timeout });
  }

  /**
   * 텍스트 존재 확인
   */
  async hasText(text: string): Promise<boolean> {
    try {
      await this.page.getByText(text).first().waitFor({ timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 페이지의 URL 반환
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * 새로고침
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * 동적 대기: 로드 완료
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * 조건이 만족될 때까지 대기 (폴링)
   * @example await basePage.waitUntil(() => listPage.getEventCount() > 0)
   */
  async waitUntil(
    condition: () => Promise<boolean>,
    options = { timeout: 5000, interval: 100 }
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < options.timeout) {
      try {
        if (await condition()) {
          return;
        }
      } catch (e) {
        // 조건 확인 실패, 계속 대기
      }
      await this.page.waitForTimeout(options.interval);
    }

    throw new Error(
      `Condition not met within ${options.timeout}ms (polling every ${options.interval}ms)`
    );
  }

  /**
   * 요소가 안정화될 때까지 대기 (DOM 업데이트 완료)
   */
  async waitForStability(locator: Locator, timeout = 5000): Promise<void> {
    let previousText = '';
    let stableCount = 0;

    while (stableCount < 2) {
      try {
        await locator.waitFor({ timeout: 1000 });
        const currentText = await locator.textContent();

        if (currentText === previousText) {
          stableCount++;
        } else {
          stableCount = 0;
          previousText = currentText;
        }

        if (Date.now() > timeout) {
          throw new Error('Element stability timeout');
        }
      } catch (e) {
        throw new Error(`Failed to wait for element stability: ${e}`);
      }
    }
  }

  /**
   * 특정 텍스트가 보이고 안정화될 때까지 대기
   */
  async waitForTextAndStability(text: string, timeout = 5000): Promise<void> {
    const locator = this.page.getByText(text).first();
    await this.waitForStability(locator, timeout);
  }

  /**
   * 화면 준비 완료 (네트워크 + DOM)
   */
  async waitForPageReady(timeout = 10000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch {
      // networkidle이 실패해도 진행 (약한 대기)
    }

    // DOM이 안정화될 때까지 추가 대기
    await this.page.waitForTimeout(500);
  }

  /**
   * 로딩 스피너 사라질 때까지 대기
   */
  async waitForLoadingToComplete(timeout = 10000): Promise<void> {
    const spinners = await this.page
      .locator('[role="progressbar"], .loading, .spinner, [aria-busy="true"]')
      .count();

    if (spinners > 0) {
      try {
        await this.page
          .locator('[role="progressbar"], .loading, .spinner, [aria-busy="true"]')
          .first()
          .waitFor({ state: 'hidden', timeout });
      } catch {
        // 로딩이 숨겨지지 않을 수 있음, 진행
      }
    }
  }

  /**
   * 요소가 클릭 가능할 때까지 대기 (보임 + 활성화)
   */
  async waitForClickable(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.evaluate((el: any) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('Element has zero dimensions');
      }
    });
  }

  /**
   * 모든 네트워크 요청이 완료될 때까지 대기
   */
  async waitForNetworkIdle(timeout = 10000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (e) {
      console.warn('Network idle timeout exceeded, proceeding anyway');
    }
  }

  /**
   * 요소의 특정 CSS 속성이 변경될 때까지 대기
   */
  async waitForCssChange(
    locator: Locator,
    property: string,
    expectedValue: string,
    timeout = 5000
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const value = await locator.evaluate(
        (el: any, prop) => window.getComputedStyle(el).getPropertyValue(prop),
        property
      );

      if (value === expectedValue) {
        return;
      }

      await this.page.waitForTimeout(100);
    }

    throw new Error(
      `CSS property ${property} did not change to ${expectedValue} within ${timeout}ms`
    );
  }
}
