/**
 * TestDataFactory
 * 일관된 테스트 데이터 생성을 위한 팩토리 클래스
 * Builder 패턴을 사용하여 유연한 데이터 생성 제공
 */

export interface EventData {
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
}

export class EventBuilder {
  private eventData: EventData = {
    title: '테스트 일정',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notification: 0,
  };

  /**
   * 제목 설정
   */
  withTitle(title: string): EventBuilder {
    this.eventData.title = title;
    return this;
  }

  /**
   * 날짜 설정
   */
  withDate(date: string): EventBuilder {
    this.eventData.date = date;
    return this;
  }

  /**
   * 시작 시간 설정
   */
  withStartTime(time: string): EventBuilder {
    this.eventData.startTime = time;
    return this;
  }

  /**
   * 종료 시간 설정
   */
  withEndTime(time: string): EventBuilder {
    this.eventData.endTime = time;
    return this;
  }

  /**
   * 설명 설정
   */
  withDescription(description: string): EventBuilder {
    this.eventData.description = description;
    return this;
  }

  /**
   * 위치 설정
   */
  withLocation(location: string): EventBuilder {
    this.eventData.location = location;
    return this;
  }

  /**
   * 카테고리 설정
   */
  withCategory(category: string): EventBuilder {
    this.eventData.category = category;
    return this;
  }

  /**
   * 반복 설정
   */
  withRepeat(
    type: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: number,
    endDate?: string
  ): EventBuilder {
    this.eventData.repeat = { type, interval, endDate };
    return this;
  }

  /**
   * 알림 설정
   */
  withNotification(minutes: number): EventBuilder {
    this.eventData.notification = minutes;
    return this;
  }

  /**
   * 빌드 (생성된 데이터 반환)
   */
  build(): EventData {
    return { ...this.eventData };
  }
}

export class TestDataFactory {
  /**
   * 기본 일정 데이터 반환
   */
  static createBasicEvent(): EventData {
    return new EventBuilder()
      .withTitle('기본 테스트 일정')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withCategory('업무')
      .build();
  }

  /**
   * 반복 일정 데이터 반환 (일간)
   */
  static createDailyRecurringEvent(): EventData {
    return new EventBuilder()
      .withTitle('매일 반복 일정')
      .withDate('2025-11-15')
      .withStartTime('09:00')
      .withEndTime('10:00')
      .withCategory('업무')
      .withRepeat('daily', 1, '2025-12-15')
      .build();
  }

  /**
   * 반복 일정 데이터 반환 (주간)
   */
  static createWeeklyRecurringEvent(): EventData {
    return new EventBuilder()
      .withTitle('매주 반복 일정')
      .withDate('2025-11-15')
      .withStartTime('14:00')
      .withEndTime('15:00')
      .withCategory('개인')
      .withRepeat('weekly', 1, '2025-12-31')
      .build();
  }

  /**
   * 겹침 테스트용 일정 (시간 겹침)
   */
  static createOverlappingEvent(): EventData {
    return new EventBuilder()
      .withTitle('겹침 테스트 일정')
      .withDate('2025-11-15')
      .withStartTime('10:30') // 기본 일정(10:00-11:00)과 겹침
      .withEndTime('11:30')
      .withCategory('개인')
      .build();
  }

  /**
   * 알림 테스트용 일정
   */
  static createEventWithNotification(): EventData {
    return new EventBuilder()
      .withTitle('알림 테스트 일정')
      .withDate('2025-11-15')
      .withStartTime('15:00')
      .withEndTime('16:00')
      .withCategory('업무')
      .withNotification(10) // 10분 전 알림
      .build();
  }

  /**
   * 검색 테스트용 일정들
   */
  static createSearchTestEvents(): EventData[] {
    return [
      new EventBuilder()
        .withTitle('팀 회의')
        .withDate('2025-11-20')
        .withStartTime('10:00')
        .withEndTime('11:00')
        .withDescription('주간 팀 미팅')
        .withLocation('회의실 A')
        .withCategory('업무')
        .build(),

      new EventBuilder()
        .withTitle('프로젝트 리뷰')
        .withDate('2025-11-21')
        .withStartTime('14:00')
        .withEndTime('15:00')
        .withDescription('분기 프로젝트 리뷰')
        .withLocation('컨퍼런스홀')
        .withCategory('업무')
        .build(),

      new EventBuilder()
        .withTitle('개인 운동')
        .withDate('2025-11-22')
        .withStartTime('17:00')
        .withEndTime('18:00')
        .withDescription('헬스장')
        .withLocation('피트니스센터')
        .withCategory('개인')
        .build(),

      new EventBuilder()
        .withTitle('점심 약속')
        .withDate('2025-11-23')
        .withStartTime('12:00')
        .withEndTime('13:00')
        .withDescription('친구와 점심')
        .withLocation('카페')
        .withCategory('개인')
        .build(),
    ];
  }

  /**
   * 오버플로우 테스트용 긴 제목 일정
   */
  static createLongTitleEvent(): EventData {
    return new EventBuilder()
      .withTitle(
        '이것은 매우 매우 매우 긴 일정 제목입니다 텍스트가 너무 길어서 한 줄에 다 들어가지 않을 수 있습니다'
      )
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withCategory('업무')
      .build();
  }

  /**
   * 오버플로우 테스트용 긴 설명 일정
   */
  static createLongDescriptionEvent(): EventData {
    return new EventBuilder()
      .withTitle('긴 설명 테스트')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withDescription('이것은 매우 긴 설명입니다. '.repeat(50))
      .withCategory('업무')
      .build();
  }

  /**
   * 빈 설명 필드 테스트용 일정
   */
  static createEventWithEmptyFields(): EventData {
    return new EventBuilder()
      .withTitle('')
      .withDate('')
      .withStartTime('')
      .withEndTime('')
      .build();
  }

  /**
   * 특수문자 포함 일정
   */
  static createEventWithSpecialCharacters(): EventData {
    return new EventBuilder()
      .withTitle('회의 📅 (긴급) 🔥 @참석자들 #프로젝트A & 프로젝트B')
      .withDate('2025-11-15')
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withCategory('업무')
      .build();
  }

  /**
   * 오늘 날짜의 일정 (시간 의존 테스트용)
   */
  static createEventForToday(): EventData {
    const today = new Date().toISOString().split('T')[0];
    return new EventBuilder()
      .withTitle('오늘의 일정')
      .withDate(today)
      .withStartTime('10:00')
      .withEndTime('11:00')
      .withCategory('업무')
      .build();
  }

  /**
   * Builder 객체 반환 (고급 커스터마이징용)
   */
  static builder(): EventBuilder {
    return new EventBuilder();
  }
}
