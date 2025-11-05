import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect } from 'vitest';

import { setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

const simulateDragAndDrop = (draggedElement: HTMLElement, dropTarget: HTMLElement) => {
  const dataTransfer = new DataTransfer();

  fireEvent.dragStart(draggedElement, { dataTransfer });
  fireEvent.dragOver(dropTarget, { dataTransfer });
  fireEvent.drop(dropTarget, { dataTransfer });
  fireEvent.dragEnd(draggedElement, { dataTransfer });
};

describe('드래그 앤 드롭 이벤트 이동 기능', () => {
  describe('주간 뷰에서 드래그 앤 드롭', () => {
    it('주간 뷰에서 다른 날짜로 이벤트를 드래그하면 날짜가 변경되고 시간은 유지된다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '드래그 테스트 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const eventBox = screen.getByTestId('event-box-1');
      const targetCell = screen.getByTestId('week-cell-2025-10-03');

      simulateDragAndDrop(eventBox, targetCell);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('2025-10-03')).toBeInTheDocument();
        expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
      });
    });

    it('주간 뷰에서 같은 날짜로 드래그하면 변경되지 않는다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '드래그 테스트 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const eventBox = screen.getByTestId('event-box-1');
      const sameCell = screen.getByTestId('week-cell-2025-10-01');

      simulateDragAndDrop(eventBox, sameCell);

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2025-10-01')).toBeInTheDocument();
      expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    });
  });

  describe('월간 뷰에서 드래그 앤 드롭', () => {
    it('월간 뷰에서 다른 날짜로 이벤트를 드래그하면 날짜가 변경되고 시간은 유지된다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '드래그 테스트 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const eventBox = screen.getByTestId('event-box-1');
      const targetCell = screen.getByTestId('month-cell-2025-10-15');

      simulateDragAndDrop(eventBox, targetCell);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
        expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
      });
    });

    it('월간 뷰에서 월의 마지막 날로 드래그해도 정상적으로 이동한다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '드래그 테스트 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const eventBox = screen.getByTestId('event-box-1');
      const targetCell = screen.getByTestId('month-cell-2025-10-31');

      simulateDragAndDrop(eventBox, targetCell);

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('2025-10-31')).toBeInTheDocument();
        expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
      });
    });
  });

  describe('에러 처리 및 엣지 케이스', () => {
    it('API 업데이트 실패 시 에러 메시지가 표시되고 이벤트가 원래 위치에 유지된다', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '드래그 테스트 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', () => {
          return HttpResponse.error();
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const eventBox = screen.getByTestId('event-box-1');
      const targetCell = screen.getByTestId('week-cell-2025-10-03');

      simulateDragAndDrop(eventBox, targetCell);

      expect(await screen.findByText('일정 저장 실패')).toBeInTheDocument();

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('2025-10-01')).toBeInTheDocument();
    });

    it('이벤트를 이미 일정이 있는 날짜로 드롭하면 겹침 경고 다이얼로그가 표시되고 계속 진행하면 이동한다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '이동할 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '대상 날짜 이벤트',
          date: '2025-10-03',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const eventBox = screen.getByTestId('event-box-1');
      const targetCell = screen.getByTestId('week-cell-2025-10-03');

      simulateDragAndDrop(eventBox, targetCell);

      expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();

      await user.click(screen.getByText('계속'));

      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        const dates = eventList.getAllByText('2025-10-03');
        expect(dates.length).toBeGreaterThan(0);
      });
    });

    it('겹침 경고 다이얼로그에서 취소를 선택하면 이벤트가 원래 위치에 유지된다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '이동할 이벤트',
          date: '2025-10-01',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '대상 날짜 이벤트',
          date: '2025-10-03',
          startTime: '14:00',
          endTime: '15:00',
          description: '테스트 설명',
          location: '테스트 장소',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      const eventBox = screen.getByTestId('event-box-1');
      const targetCell = screen.getByTestId('week-cell-2025-10-03');

      simulateDragAndDrop(eventBox, targetCell);

      expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();

      await user.click(screen.getByText('취소'));

      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('이동할 이벤트')).toBeInTheDocument();
      expect(eventList.getByText('2025-10-01')).toBeInTheDocument();
    });
  });

  describe('반복 이벤트 처리 (추후 구현)', () => {
    it.skip('반복 일정은 드래그할 수 없다', async () => {
      // 추후 구현
    });
  });
});
