import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../../App';

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

describe('날짜 셀 클릭으로 폼 자동 채우기', () => {
  describe('주간 뷰', () => {
    it('빈 날짜 셀을 클릭하면 해당 날짜가 날짜 입력 필드에 YYYY-MM-DD 형식으로 채워진다', async () => {
      /**
       * 요구사항:
       * - 주간 뷰의 빈 셀 클릭 시 handleCellClick(date) 함수 호출
       * - date를 YYYY-MM-DD 형식으로 포맷하여 setDate() 호출
       *
       * 테스트 시나리오:
       * 1. 2025-10-02 (목요일) 셀 클릭
       * 2. 날짜 입력 필드의 value가 '2025-10-02'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 2025-10-02 (목요일) 셀 클릭
      const thursdayCell = screen.getByTestId('week-cell-2025-10-02');
      await user.click(thursdayCell);

      // 날짜 입력 필드 확인
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-02');
    });

    it('주말 날짜 셀(토요일)을 클릭하면 해당 날짜가 정확히 채워진다', async () => {
      /**
       * 요구사항:
       * - 주말(토요일) 셀도 동일하게 동작해야 함
       *
       * 테스트 시나리오:
       * 1. 2025-10-04 (토요일) 셀 클릭
       * 2. 날짜 입력 필드의 value가 '2025-10-04'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 2025-10-04 (토요일) 셀 클릭
      const saturdayCell = screen.getByTestId('week-cell-2025-10-04');
      await user.click(saturdayCell);

      // 날짜 입력 필드 확인
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-04');
    });

    it('이미 날짜가 입력된 상태에서 다른 날짜 셀을 클릭하면 기존 값이 새 값으로 덮어써진다', async () => {
      /**
       * 요구사항:
       * - 기존 날짜 값이 있어도 새로 클릭한 날짜로 덮어쓰기
       *
       * 테스트 시나리오:
       * 1. 날짜 입력 필드에 '2025-10-01' 수동 입력
       * 2. 2025-10-03 셀 클릭
       * 3. 날짜 입력 필드의 value가 '2025-10-03'으로 변경되었는지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 먼저 날짜 입력 필드에 값 설정
      const dateInput = screen.getByLabelText('날짜');
      await user.type(dateInput, '2025-10-01');
      expect((dateInput as HTMLInputElement).value).toBe('2025-10-01');

      // 다른 날짜 셀 클릭
      const fridayCell = screen.getByTestId('week-cell-2025-10-03');
      await user.click(fridayCell);

      // 날짜가 덮어써졌는지 확인
      expect((dateInput as HTMLInputElement).value).toBe('2025-10-03');
    });
  });

  describe('월간 뷰', () => {
    it('빈 날짜 셀을 클릭하면 해당 날짜가 날짜 입력 필드에 YYYY-MM-DD 형식으로 채워진다', async () => {
      /**
       * 요구사항:
       * - 월간 뷰의 빈 셀 클릭 시 handleCellClick(date) 함수 호출
       * - date를 YYYY-MM-DD 형식으로 포맷하여 setDate() 호출
       *
       * 테스트 시나리오:
       * 1. 기본 월간 뷰에서 2025-10-15 셀 클릭
       * 2. 날짜 입력 필드의 value가 '2025-10-15'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 2025-10-15 셀 클릭
      const dateCell = screen.getByTestId('month-cell-2025-10-15');
      await user.click(dateCell);

      // 날짜 입력 필드 확인
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-15');
    });

    it('월의 첫 번째 날짜 셀을 클릭하면 정확히 채워진다', async () => {
      /**
       * 요구사항:
       * - 월의 첫 날(1일) 셀도 정확히 동작해야 함
       *
       * 테스트 시나리오:
       * 1. 2025-10-01 (월의 첫날) 셀 클릭
       * 2. 날짜 입력 필드의 value가 '2025-10-01'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 2025-10-01 셀 클릭
      const firstDayCell = screen.getByTestId('month-cell-2025-10-01');
      await user.click(firstDayCell);

      // 날짜 입력 필드 확인
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-01');
    });

    it('월의 마지막 날짜 셀을 클릭하면 정확히 채워진다', async () => {
      /**
       * 요구사항:
       * - 월의 마지막 날(31일) 셀도 정확히 동작해야 함
       *
       * 테스트 시나리오:
       * 1. 2025-10-31 (월의 마지막날) 셀 클릭
       * 2. 날짜 입력 필드의 value가 '2025-10-31'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 2025-10-31 셀 클릭
      const lastDayCell = screen.getByTestId('month-cell-2025-10-31');
      await user.click(lastDayCell);

      // 날짜 입력 필드 확인
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-31');
    });

    it('이미 날짜가 입력된 상태에서 다른 날짜 셀을 클릭하면 기존 값이 새 값으로 덮어써진다', async () => {
      /**
       * 요구사항:
       * - 기존 날짜 값이 있어도 새로 클릭한 날짜로 덮어쓰기
       *
       * 테스트 시나리오:
       * 1. 날짜 입력 필드에 '2025-10-10' 수동 입력
       * 2. 2025-10-20 셀 클릭
       * 3. 날짜 입력 필드의 value가 '2025-10-20'으로 변경되었는지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 먼저 날짜 입력 필드에 값 설정
      const dateInput = screen.getByLabelText('날짜');
      await user.type(dateInput, '2025-10-10');
      expect((dateInput as HTMLInputElement).value).toBe('2025-10-10');

      // 다른 날짜 셀 클릭
      const dateCell = screen.getByTestId('month-cell-2025-10-20');
      await user.click(dateCell);

      // 날짜가 덮어써졌는지 확인
      expect((dateInput as HTMLInputElement).value).toBe('2025-10-20');
    });
  });

  describe('뷰 전환 시나리오', () => {
    it('월간 뷰에서 날짜 셀을 클릭한 후 주간 뷰로 전환해도 선택한 날짜가 유지된다', async () => {
      /**
       * 요구사항:
       * - 뷰 전환 시에도 선택한 날짜가 폼에 유지되어야 함
       *
       * 테스트 시나리오:
       * 1. 월간 뷰에서 2025-10-15 셀 클릭
       * 2. 날짜 입력 필드 값 확인 ('2025-10-15')
       * 3. 주간 뷰로 전환
       * 4. 날짜 입력 필드 값이 여전히 '2025-10-15'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 월간 뷰에서 날짜 셀 클릭
      const dateCell = screen.getByTestId('month-cell-2025-10-15');
      await user.click(dateCell);

      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-15');

      // 주간 뷰로 전환
      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 날짜가 여전히 유지되는지 확인
      expect(dateInput.value).toBe('2025-10-15');
    });

    it('주간 뷰에서 날짜 셀을 클릭한 후 월간 뷰로 전환해도 선택한 날짜가 유지된다', async () => {
      /**
       * 요구사항:
       * - 뷰 전환 시에도 선택한 날짜가 폼에 유지되어야 함
       *
       * 테스트 시나리오:
       * 1. 주간 뷰로 전환
       * 2. 2025-10-02 셀 클릭
       * 3. 날짜 입력 필드 값 확인 ('2025-10-02')
       * 4. 월간 뷰로 전환
       * 5. 날짜 입력 필드 값이 여전히 '2025-10-02'인지 확인
       */
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 주간 뷰로 전환
      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 날짜 셀 클릭
      const thursdayCell = screen.getByTestId('week-cell-2025-10-02');
      await user.click(thursdayCell);

      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      expect(dateInput.value).toBe('2025-10-02');

      // 월간 뷰로 전환
      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'month-option' }));

      // 날짜가 여전히 유지되는지 확인
      expect(dateInput.value).toBe('2025-10-02');
    });
  });
});
