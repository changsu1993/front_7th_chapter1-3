/**
 * ClockProvider
 * 테스트 중 시간을 Mock하기 위한 클래스
 * - 특정 시간으로 설정 가능
 * - 시간 진행 시뮬레이션 가능
 * - JavaScript Date 객체 오버라이드를 통한 구현
 */

export class ClockProvider {
  private mockTime: Date | null = null;
  private originalDateConstructor: typeof Date;
  private originalDateNow: typeof Date.now;
  private isActive = false;

  constructor() {
    this.originalDateConstructor = Date;
    this.originalDateNow = Date.now;
  }

  /**
   * Mock 시간 활성화
   * 지정된 시간으로 Date 객체를 오버라이드
   */
  activateAt(dateTimeString: string): void {
    this.mockTime = new this.originalDateConstructor(dateTimeString);
    this.applyMock();
  }

  /**
   * 현재 시간(2025-11-06)으로 Mock 설정
   */
  activateAtNow(): void {
    // 환경 변수나 현재 시스템 시간 사용
    this.mockTime = new this.originalDateConstructor();
    this.applyMock();
  }

  /**
   * Mock 시간을 특정 시간만큼 전진
   */
  advanceBy(milliseconds: number): void {
    if (!this.mockTime) {
      throw new Error('ClockProvider를 먼저 활성화해야 합니다');
    }
    this.mockTime.setTime(this.mockTime.getTime() + milliseconds);
  }

  /**
   * Mock 시간을 특정 분만큼 전진
   */
  advanceByMinutes(minutes: number): void {
    this.advanceBy(minutes * 60 * 1000);
  }

  /**
   * Mock 시간을 특정 시간만큼 전진
   */
  advanceByHours(hours: number): void {
    this.advanceBy(hours * 60 * 60 * 1000);
  }

  /**
   * Mock 시간을 특정 일만큼 전진
   */
  advanceByDays(days: number): void {
    this.advanceBy(days * 24 * 60 * 60 * 1000);
  }

  /**
   * 현재 Mock 시간 반환
   */
  getCurrentMockTime(): Date {
    if (!this.mockTime) {
      throw new Error('ClockProvider가 활성화되지 않았습니다');
    }
    return new this.originalDateConstructor(this.mockTime.getTime());
  }

  /**
   * 현재 Mock 시간을 ISO 문자열로 반환 (YYYY-MM-DD)
   */
  getCurrentDateString(): string {
    const mockDate = this.getCurrentMockTime();
    return mockDate.toISOString().split('T')[0];
  }

  /**
   * Mock 시간을 시간:분 형식으로 반환 (HH:MM)
   */
  getCurrentTimeString(): string {
    const mockDate = this.getCurrentMockTime();
    const hours = String(mockDate.getHours()).padStart(2, '0');
    const minutes = String(mockDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Mock 활성화 상태 확인
   */
  isActivated(): boolean {
    return this.isActive;
  }

  /**
   * Mock 비활성화 (Date 객체 복원)
   */
  deactivate(): void {
    if (!this.isActive) return;

    // 전역 Date 복원
    if (typeof window !== 'undefined') {
      (window as any).Date = this.originalDateConstructor;
    }

    this.mockTime = null;
    this.isActive = false;
  }

  /**
   * 내부 메서드: Date 객체 오버라이드 적용
   */
  private applyMock(): void {
    if (!this.mockTime) return;

    const mockTime = this.mockTime;
    const originalDateConstructor = this.originalDateConstructor;
    const originalDateNow = this.originalDateNow;

    // Mock Date 클래스
    const MockDate = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          // new Date() - Mock 시간 반환
          super(mockTime.getTime());
        } else {
          // new Date(arg) - 정상 처리
          super(...args);
        }
      }

      static now(): number {
        return mockTime.getTime();
      }

      static parse(s: string): number {
        return originalDateConstructor.parse(s);
      }

      static UTC(...args: any[]): number {
        return originalDateConstructor.UTC(...args);
      }
    } as any;

    // 필요한 프로토타입 메서드 복사
    Object.setPrototypeOf(MockDate, originalDateConstructor);
    Object.setPrototypeOf(MockDate.prototype, Date.prototype);

    // 전역 Date 오버라이드
    if (typeof window !== 'undefined') {
      (window as any).Date = MockDate;
    }

    this.isActive = true;
  }

  /**
   * 테스트용 헬퍼: 특정 날짜와 시간으로 Mock 설정
   * @example setDateTime('2025-11-15', '14:30')
   */
  setDateTime(dateString: string, timeString?: string): void {
    let dateTimeString = dateString;

    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new this.originalDateConstructor(dateString);
      date.setHours(hours || 0, minutes || 0, 0, 0);
      this.mockTime = date;
    } else {
      this.mockTime = new this.originalDateConstructor(dateString);
    }

    this.applyMock();
  }

  /**
   * 테스트 정리용: 자동으로 deactivate 처리
   */
  async cleanup(): Promise<void> {
    this.deactivate();
  }
}

/**
 * 싱글톤 인스턴스 (필요에 따라 사용)
 */
export const globalClock = new ClockProvider();
