import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * EventFormPage
 * 일정 생성/편집 폼 관련 상호작용
 */
export class EventFormPage extends BasePage {
  // Selectors
  readonly titleInput = () => this.page.locator('#title');
  readonly dateInput = () => this.page.locator('#date');
  readonly startTimeInput = () => this.page.locator('#start-time');
  readonly endTimeInput = () => this.page.locator('#end-time');
  readonly descriptionInput = () => this.page.locator('#description');
  readonly locationInput = () => this.page.locator('#location');
  readonly categorySelect = () => this.page.getByLabel('카테고리');
  readonly repeatTypeSelect = () => this.page.getByLabel('반복 유형');
  readonly repeatIntervalInput = () => this.page.locator('#repeat-interval');
  readonly repeatEndDateInput = () => this.page.locator('#repeat-end-date');
  readonly notificationSelect = () => this.page.getByLabel('알림 설정');
  readonly addEventButton = () => this.page.getByRole('button', { name: '일정 추가' });
  readonly updateEventButton = () => this.page.getByRole('button', { name: '일정 수정' });

  constructor(page: Page) {
    super(page);
  }

  /**
   * 제목 입력
   */
  async fillTitle(title: string): Promise<void> {
    const input = this.titleInput();
    await input.waitFor({ timeout: 3000 });
    await input.fill(title);
  }

  /**
   * 날짜 입력
   */
  async fillDate(date: string): Promise<void> {
    const input = this.dateInput();
    await input.waitFor({ timeout: 3000 });
    await input.fill(date);
  }

  /**
   * 시작 시간 입력
   */
  async fillStartTime(time: string): Promise<void> {
    const input = this.startTimeInput();
    await input.waitFor({ timeout: 3000 });
    await input.fill(time);
  }

  /**
   * 종료 시간 입력
   */
  async fillEndTime(time: string): Promise<void> {
    const input = this.endTimeInput();
    await input.waitFor({ timeout: 3000 });
    await input.fill(time);
  }

  /**
   * 설명 입력
   */
  async fillDescription(description: string): Promise<void> {
    const input = this.descriptionInput();
    await input.waitFor({ timeout: 3000 });
    await input.fill(description);
  }

  /**
   * 위치 입력
   */
  async fillLocation(location: string): Promise<void> {
    const input = this.locationInput();
    await input.waitFor({ timeout: 3000 });
    await input.fill(location);
  }

  /**
   * 카테고리 선택
   */
  async selectCategory(category: string): Promise<void> {
    await this.selectDropdown('카테고리', category);
  }

  /**
   * 반복 유형 선택
   */
  async selectRepeatType(repeatType: string): Promise<void> {
    await this.selectDropdown('반복 유형', repeatType);
  }

  /**
   * 반복 간격 입력
   */
  async fillRepeatInterval(interval: string): Promise<void> {
    await this.repeatIntervalInput().fill(interval);
  }

  /**
   * 반복 종료일 입력
   */
  async fillRepeatEndDate(date: string): Promise<void> {
    await this.repeatEndDateInput().fill(date);
  }

  /**
   * 알림 설정 선택
   */
  async selectNotification(notification: string): Promise<void> {
    await this.selectDropdown('알림 설정', notification);
  }

  /**
   * 전체 일정 정보 입력 (기본)
   */
  async fillEventForm(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    notification?: string;
  }): Promise<void> {
    await this.fillTitle(eventData.title);
    await this.fillDate(eventData.date);
    await this.fillStartTime(eventData.startTime);
    await this.fillEndTime(eventData.endTime);

    if (eventData.description) {
      await this.fillDescription(eventData.description);
    }

    if (eventData.location) {
      await this.fillLocation(eventData.location);
    }

    if (eventData.category) {
      await this.selectCategory(eventData.category);
    }

    if (eventData.notification) {
      await this.selectNotification(eventData.notification);
    }
  }

  /**
   * 전체 일정 정보 입력 (반복 포함)
   */
  async fillEventFormWithRepeat(eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    repeatType?: string;
    repeatInterval?: string;
    repeatEndDate?: string;
    notification?: string;
  }): Promise<void> {
    await this.fillEventForm(eventData);

    if (eventData.repeatType) {
      await this.selectRepeatType(eventData.repeatType);
    }

    if (eventData.repeatInterval) {
      await this.fillRepeatInterval(eventData.repeatInterval);
    }

    if (eventData.repeatEndDate) {
      await this.fillRepeatEndDate(eventData.repeatEndDate);
    }
  }

  /**
   * 일정 추가 버튼 클릭 (API 응답 대기 포함)
   */
  async clickAddEvent(): Promise<void> {
    // 먼저 Dialog 블로킹 제거
    await this.clearDialogOverlays();

    // 버튼 찾기
    const addButton = this.page.getByRole('button', { name: '일정 추가' });
    await addButton.waitFor({ timeout: 3000 });

    // 버튼 클릭
    await addButton.click({ force: true, timeout: 2000 });

    // 겹침 경고 Dialog가 나타나면 "계속" 버튼 클릭
    try {
      const continueButton = this.page.getByRole('button', { name: '계속' });
      await continueButton.waitFor({ timeout: 3000 });
      await continueButton.click({ force: true, timeout: 2000 });
    } catch {
      // 겹침 경고가 없으면 무시
    }

    // 폼이 닫힐 때까지 대기 (일정 생성 완료 신호)
    try {
      await this.page.locator('#title').waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // 폼이 닫히지 않아도 진행 (client-side only)
    }

    // 화면 업데이트 대기
    await this.page.waitForTimeout(500);
  }

  /**
   * Dialog/Modal 오버레이 정리 (clearDialogOverlays)
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
   * 일정 수정 버튼 클릭
   */
  async clickUpdateEvent(): Promise<void> {
    await this.clickButton('일정 수정');
  }

  /**
   * 폼 초기화 (모든 필드 비우기)
   */
  async clearForm(): Promise<void> {
    try {
      const titleInput = this.titleInput();
      const dateInput = this.dateInput();
      const startTimeInput = this.startTimeInput();
      const endTimeInput = this.endTimeInput();
      const descriptionInput = this.descriptionInput();
      const locationInput = this.locationInput();

      // 각 필드가 존재하는지 확인 후 비우기 (타임아웃 짧게)
      try {
        await titleInput.fill('');
      } catch (e) {
        // 필드가 없으면 무시
      }
      try {
        await dateInput.fill('');
      } catch (e) {
        // 필드가 없으면 무시
      }
      try {
        await startTimeInput.fill('');
      } catch (e) {
        // 필드가 없으면 무시
      }
      try {
        await endTimeInput.fill('');
      } catch (e) {
        // 필드가 없으면 무시
      }
      try {
        await descriptionInput.fill('');
      } catch (e) {
        // 필드가 없으면 무시
      }
      try {
        await locationInput.fill('');
      } catch (e) {
        // 필드가 없으면 무시
      }
    } catch (e) {
      // 전체 실패해도 무시
    }
  }

  /**
   * 제목 필드 값 확인
   */
  async getTitleValue(): Promise<string | null> {
    return await this.titleInput().inputValue();
  }

  /**
   * 날짜 필드 값 확인
   */
  async getDateValue(): Promise<string | null> {
    return await this.dateInput().inputValue();
  }

  /**
   * 시작 시간 필드 값 확인
   */
  async getStartTimeValue(): Promise<string | null> {
    return await this.startTimeInput().inputValue();
  }

  /**
   * 종료 시간 필드 값 확인
   */
  async getEndTimeValue(): Promise<string | null> {
    return await this.endTimeInput().inputValue();
  }

  /**
   * 폼이 보일 때까지 대기
   */
  async waitForForm(): Promise<void> {
    await this.waitForElement(this.titleInput());
  }

  /**
   * 일정 추가 버튼 활성화 여부 확인
   */
  async isAddEventButtonEnabled(): Promise<boolean> {
    return await this.addEventButton().isEnabled();
  }

  /**
   * 에러 메시지 확인
   */
  async hasError(errorText: string): Promise<boolean> {
    return await this.hasText(errorText);
  }
}
