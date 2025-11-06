import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';

import EventForm from './EventForm';

const meta = {
  title: 'Components/EventForm',
  component: EventForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: 'select',
      options: ['업무', '개인', '가족', '기타'],
    },
    repeatType: {
      control: 'select',
      options: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    },
    notificationTime: {
      control: 'select',
      options: [1, 10, 60, 120, 1440],
    },
    isLoading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof EventForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper to manage state
const InteractiveForm = (args: Story['args']) => {
  const [title, setTitle] = useState(args.title);
  const [date, setDate] = useState(args.date);
  const [startTime, setStartTime] = useState(args.startTime);
  const [endTime, setEndTime] = useState(args.endTime);
  const [description, setDescription] = useState(args.description);
  const [location, setLocation] = useState(args.location);
  const [category, setCategory] = useState(args.category);
  const [isRepeating, setIsRepeating] = useState(args.isRepeating);
  const [repeatType, setRepeatType] = useState(args.repeatType);
  const [repeatInterval, setRepeatInterval] = useState(args.repeatInterval);
  const [repeatEndDate, setRepeatEndDate] = useState(args.repeatEndDate);
  const [notificationTime, setNotificationTime] = useState(args.notificationTime);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  return (
    <EventForm
      {...args}
      title={title}
      setTitle={setTitle}
      date={date}
      setDate={setDate}
      startTime={startTime}
      handleStartTimeChange={handleStartTimeChange}
      endTime={endTime}
      handleEndTimeChange={handleEndTimeChange}
      description={description}
      setDescription={setDescription}
      location={location}
      setLocation={setLocation}
      category={category}
      setCategory={setCategory}
      isRepeating={isRepeating}
      setIsRepeating={setIsRepeating}
      repeatType={repeatType}
      setRepeatType={setRepeatType}
      repeatInterval={repeatInterval}
      setRepeatInterval={setRepeatInterval}
      repeatEndDate={repeatEndDate}
      setRepeatEndDate={setRepeatEndDate}
      notificationTime={notificationTime}
      setNotificationTime={setNotificationTime}
    />
  );
};

// 빈 폼 (초기 상태)
export const Empty: Story = {
  args: {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 채워진 폼
export const Filled: Story = {
  args: {
    title: '팀 회의',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 에러 상태 (시간 유효성 오류)
export const WithTimeError: Story = {
  args: {
    title: '잘못된 시간',
    date: '2025-11-15',
    startTime: '15:00',
    endTime: '14:00',
    description: '종료 시간이 시작 시간보다 이릅니다',
    location: '',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 로딩 상태
export const Loading: Story = {
  args: {
    title: '저장 중인 일정',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '로딩 상태 테스트',
    location: '회의실 B',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: true,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 업무 카테고리
export const WorkCategory: Story = {
  args: {
    title: '프로젝트 기획 회의',
    date: '2025-11-20',
    startTime: '14:00',
    endTime: '16:00',
    description: 'Q4 프로젝트 계획 수립',
    location: '대회의실',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 60,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 개인 카테고리
export const PersonalCategory: Story = {
  args: {
    title: '헬스장 운동',
    date: '2025-11-18',
    startTime: '18:00',
    endTime: '19:30',
    description: '하체 운동 데이',
    location: '피트니스 센터',
    category: '개인',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 120,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 가족 카테고리
export const FamilyCategory: Story = {
  args: {
    title: '가족 저녁 식사',
    date: '2025-11-22',
    startTime: '19:00',
    endTime: '21:00',
    description: '부모님과 함께',
    location: '집',
    category: '가족',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 1440,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 반복 일정 (매주)
export const WithWeeklyRepeat: Story = {
  args: {
    title: '주간 스터디',
    date: '2025-11-15',
    startTime: '20:00',
    endTime: '22:00',
    description: '알고리즘 스터디',
    location: '스터디 카페',
    category: '개인',
    isRepeating: true,
    repeatType: 'weekly',
    repeatInterval: 1,
    repeatEndDate: '2025-12-31',
    notificationTime: 60,
    startTimeError: null,
    endTimeError: null,
    editingEvent: false,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};

// 수정 모드
export const EditMode: Story = {
  args: {
    title: '수정할 회의',
    date: '2025-11-25',
    startTime: '11:00',
    endTime: '12:00',
    description: '수정된 설명',
    location: '회의실 C',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: true,
    onSubmit: fn(),
    isLoading: false,
    setTitle: fn(),
    setDate: fn(),
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    setDescription: fn(),
    setLocation: fn(),
    setCategory: fn(),
    setIsRepeating: fn(),
    setRepeatType: fn(),
    setRepeatInterval: fn(),
    setRepeatEndDate: fn(),
    setNotificationTime: fn(),
  },
  render: (args) => <InteractiveForm {...args} />,
};
