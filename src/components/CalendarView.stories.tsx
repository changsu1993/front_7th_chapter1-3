import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Event } from '../types';
import CalendarView from './CalendarView';

const meta = {
  title: 'Components/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: 'select',
      options: ['week', 'month'],
    },
  },
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 데이터
const baseDate = new Date('2025-11-15');

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
  {
    id: '4',
    title: '생일 파티',
    date: '2025-11-22',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 120,
  },
];

const recurringEvents: Event[] = [
  {
    id: '10',
    title: '매주 스터디',
    date: '2025-11-11',
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
  },
  {
    id: '11',
    title: '매주 스터디',
    date: '2025-11-18',
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
  },
  {
    id: '12',
    title: '매주 스터디',
    date: '2025-11-25',
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
  },
];

const manyEvents: Event[] = [
  ...sampleEvents,
  {
    id: '5',
    title: '아침 회의',
    date: '2025-11-18',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: '점심 약속',
    date: '2025-11-18',
    startTime: '12:00',
    endTime: '13:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '7',
    title: '저녁 스터디',
    date: '2025-11-18',
    startTime: '18:00',
    endTime: '19:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const holidays = {
  '2025-11-03': '문화의 날',
  '2025-11-09': '한글날 대체',
  '2025-11-11': '11월 11일',
};

// 월간 뷰 (비어있음)
export const MonthViewEmpty: Story = {
  args: {
    view: 'month',
    currentDate: baseDate,
    events: [],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 월간 뷰 (일정 있음)
export const MonthViewWithEvents: Story = {
  args: {
    view: 'month',
    currentDate: baseDate,
    events: sampleEvents,
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 월간 뷰 (반복 일정)
export const MonthViewWithRecurringEvents: Story = {
  args: {
    view: 'month',
    currentDate: baseDate,
    events: [...sampleEvents, ...recurringEvents],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 월간 뷰 (공휴일 표시)
export const MonthViewWithHolidays: Story = {
  args: {
    view: 'month',
    currentDate: baseDate,
    events: sampleEvents,
    notifiedEvents: [],
    holidays: holidays,
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 월간 뷰 (알림 표시)
export const MonthViewWithNotifications: Story = {
  args: {
    view: 'month',
    currentDate: baseDate,
    events: sampleEvents,
    notifiedEvents: ['1', '2'],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 월간 뷰 (많은 일정)
export const MonthViewWithManyEvents: Story = {
  args: {
    view: 'month',
    currentDate: baseDate,
    events: manyEvents,
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 주간 뷰 (비어있음)
export const WeekViewEmpty: Story = {
  args: {
    view: 'week',
    currentDate: baseDate,
    events: [],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 주간 뷰 (일정 있음)
export const WeekViewWithEvents: Story = {
  args: {
    view: 'week',
    currentDate: baseDate,
    events: [
      sampleEvents[0], // 2025-11-15 (금요일)
      sampleEvents[1], // 2025-11-15 (금요일)
      {
        id: '20',
        title: '월요일 회의',
        date: '2025-11-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '21',
        title: '수요일 약속',
        date: '2025-11-12',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 주간 뷰 (드래그 가능 일정)
export const WeekViewDraggable: Story = {
  args: {
    view: 'week',
    currentDate: baseDate,
    events: [
      {
        id: '30',
        title: '드래그 가능',
        date: '2025-11-11',
        startTime: '10:00',
        endTime: '11:00',
        description: '이 일정은 드래그 가능합니다',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '31',
        title: '드래그 불가',
        date: '2025-11-13',
        startTime: '14:00',
        endTime: '15:00',
        description: '반복 일정은 드래그 불가',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          id: 'repeat-drag',
        },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 주간 뷰 (반복 일정)
export const WeekViewWithRecurringEvents: Story = {
  args: {
    view: 'week',
    currentDate: baseDate,
    events: [
      {
        id: '40',
        title: '매일 운동',
        date: '2025-11-10',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 조깅',
        location: '공원',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          id: 'daily-1',
        },
        notificationTime: 10,
      },
      {
        id: '41',
        title: '매일 운동',
        date: '2025-11-11',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 조깅',
        location: '공원',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          id: 'daily-1',
        },
        notificationTime: 10,
      },
      {
        id: '42',
        title: '매일 운동',
        date: '2025-11-12',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 조깅',
        location: '공원',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          id: 'daily-1',
        },
        notificationTime: 10,
      },
      {
        id: '43',
        title: '매일 운동',
        date: '2025-11-13',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 조깅',
        location: '공원',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          id: 'daily-1',
        },
        notificationTime: 10,
      },
      {
        id: '44',
        title: '매일 운동',
        date: '2025-11-14',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 조깅',
        location: '공원',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          id: 'daily-1',
        },
        notificationTime: 10,
      },
      {
        id: '45',
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
          id: 'daily-1',
        },
        notificationTime: 10,
      },
      {
        id: '46',
        title: '매일 운동',
        date: '2025-11-16',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 조깅',
        location: '공원',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          id: 'daily-1',
        },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 주간 뷰 (알림 표시)
export const WeekViewWithNotifications: Story = {
  args: {
    view: 'week',
    currentDate: baseDate,
    events: [
      {
        id: '50',
        title: '긴급 회의',
        date: '2025-11-13',
        startTime: '10:00',
        endTime: '11:00',
        description: '알림 발생',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '51',
        title: '중요 약속',
        date: '2025-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '알림 발생',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['50', '51'],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 다른 월 (2025년 12월)
export const DifferentMonth: Story = {
  args: {
    view: 'month',
    currentDate: new Date('2025-12-15'),
    events: [
      {
        id: '60',
        title: '크리스마스 파티',
        date: '2025-12-25',
        startTime: '18:00',
        endTime: '22:00',
        description: '연말 파티',
        location: '회사',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1440,
      },
      {
        id: '61',
        title: '연말 정산',
        date: '2025-12-31',
        startTime: '09:00',
        endTime: '18:00',
        description: '마감일',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1440,
      },
    ],
    notifiedEvents: [],
    holidays: {
      '2025-12-25': '크리스마스',
    },
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};

// 겹치는 일정
export const OverlappingEvents: Story = {
  args: {
    view: 'week',
    currentDate: baseDate,
    events: [
      {
        id: '70',
        title: '회의 A',
        date: '2025-11-13',
        startTime: '14:00',
        endTime: '15:00',
        description: '첫 번째 회의',
        location: '회의실 1',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '71',
        title: '회의 B',
        date: '2025-11-13',
        startTime: '14:30',
        endTime: '15:30',
        description: '두 번째 회의 (겹침)',
        location: '회의실 2',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '72',
        title: '회의 C',
        date: '2025-11-13',
        startTime: '15:00',
        endTime: '16:00',
        description: '세 번째 회의',
        location: '회의실 3',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
    holidays: {},
    onCellClick: fn(),
    onDragStart: fn(),
    onDragOver: fn(),
    onDrop: fn(),
  },
};
