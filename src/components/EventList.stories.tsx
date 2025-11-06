import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Event } from '../types';
import EventList from './EventList';

const meta = {
  title: 'Components/EventList',
  component: EventList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    searchTerm: {
      control: 'text',
    },
  },
} satisfies Meta<typeof EventList>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 데이터
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-11-15',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '프로젝트 마감',
    date: '2025-11-20',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1440,
  },
];

const recurringEvent: Event = {
  id: '4',
  title: '주간 스터디',
  date: '2025-11-15',
  startTime: '20:00',
  endTime: '22:00',
  description: '알고리즘 스터디',
  location: '스터디 카페',
  category: '개인',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-1',
  },
  notificationTime: 60,
};

const recurringEvent2: Event = {
  id: '5',
  title: '매일 운동',
  date: '2025-11-15',
  startTime: '07:00',
  endTime: '08:00',
  description: '아침 조깅',
  location: '공원',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
    id: 'repeat-2',
  },
  notificationTime: 10,
};

const overlappingEvent1: Event = {
  id: '6',
  title: '회의 A',
  date: '2025-11-18',
  startTime: '14:00',
  endTime: '15:00',
  description: '첫 번째 회의',
  location: '회의실 1',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const overlappingEvent2: Event = {
  id: '7',
  title: '회의 B',
  date: '2025-11-18',
  startTime: '14:30',
  endTime: '15:30',
  description: '두 번째 회의 (겹침)',
  location: '회의실 2',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

// 빈 리스트
export const Empty: Story = {
  args: {
    events: [],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 단일 일정 (일반)
export const SingleEvent: Story = {
  args: {
    events: [sampleEvents[0]],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 단일 일정 (반복)
export const SingleRecurringEvent: Story = {
  args: {
    events: [recurringEvent],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 여러 일정 (일반 + 반복 섞임)
export const MultipleEvents: Story = {
  args: {
    events: [...sampleEvents, recurringEvent, recurringEvent2],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 알림 표시된 일정
export const WithNotifications: Story = {
  args: {
    events: sampleEvents,
    notifiedEvents: ['1', '2'],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 겹치는 일정 표시
export const OverlappingEvents: Story = {
  args: {
    events: [overlappingEvent1, overlappingEvent2],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 검색 결과 표시
export const WithSearchTerm: Story = {
  args: {
    events: [sampleEvents[0]], // "팀 회의"
    notifiedEvents: [],
    searchTerm: '팀',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 검색 결과 없음
export const NoSearchResults: Story = {
  args: {
    events: [],
    notifiedEvents: [],
    searchTerm: '찾을 수 없는 검색어',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 다양한 카테고리
export const MixedCategories: Story = {
  args: {
    events: [
      sampleEvents[0], // 업무
      sampleEvents[1], // 개인
      {
        id: '8',
        title: '가족 저녁',
        date: '2025-11-22',
        startTime: '19:00',
        endTime: '21:00',
        description: '부모님과 함께',
        location: '집',
        category: '가족',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 120,
      },
      {
        id: '9',
        title: '기타 일정',
        date: '2025-11-23',
        startTime: '15:00',
        endTime: '16:00',
        description: '기타 카테고리',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 모든 알림 시간 옵션
export const AllNotificationTimes: Story = {
  args: {
    events: [
      {
        id: '10',
        title: '1분 전 알림',
        date: '2025-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '1분 전 알림 설정',
        location: '장소1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '11',
        title: '10분 전 알림',
        date: '2025-11-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '10분 전 알림 설정',
        location: '장소2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '12',
        title: '1시간 전 알림',
        date: '2025-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '1시간 전 알림 설정',
        location: '장소3',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
      {
        id: '13',
        title: '2시간 전 알림',
        date: '2025-11-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '2시간 전 알림 설정',
        location: '장소4',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 120,
      },
      {
        id: '14',
        title: '1일 전 알림',
        date: '2025-11-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '1일 전 알림 설정',
        location: '장소5',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1440,
      },
    ],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

// 모든 반복 유형
export const AllRepeatTypes: Story = {
  args: {
    events: [
      {
        id: '15',
        title: '매일 반복',
        date: '2025-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매일 반복 일정',
        location: '장소A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, id: 'r1' },
        notificationTime: 10,
      },
      {
        id: '16',
        title: '매주 반복',
        date: '2025-11-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '매주 반복 일정',
        location: '장소B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, id: 'r2' },
        notificationTime: 10,
      },
      {
        id: '17',
        title: '매월 반복',
        date: '2025-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매월 반복 일정',
        location: '장소C',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, id: 'r3' },
        notificationTime: 10,
      },
      {
        id: '18',
        title: '매년 반복',
        date: '2025-11-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '매년 반복 일정',
        location: '장소D',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-12-31', id: 'r4' },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};
