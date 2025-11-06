import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { Event, RepeatType } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

export interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays?: Record<string, string>;
  onCellClick?: (date: Date) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, event: Event) => void;
  onDragOver?: (e: React.DragEvent<HTMLTableCellElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLTableCellElement>, targetDate: string) => void;
}

const CalendarView = ({
  view,
  currentDate,
  events,
  notifiedEvents,
  holidays = {},
  onCellClick,
  onDragStart,
  onDragOver,
  onDrop,
}: CalendarViewProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: Event) => {
    if (event.repeat.type !== 'none') return;
    if (onDragStart) {
      onDragStart(e, event);
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => (
                  <TableCell
                    key={date.toISOString()}
                    data-testid={`week-cell-${date.toISOString().split('T')[0]}`}
                    onClick={() => onCellClick && onCellClick(date)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop && onDrop(e, date.toISOString().split('T')[0])}
                    sx={{
                      height: '120px',
                      verticalAlign: 'top',
                      width: '14.28%',
                      padding: 1,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {date.getDate()}
                    </Typography>
                    {events
                      .filter(
                        (event) => new Date(event.date).toDateString() === date.toDateString()
                      )
                      .map((event) => {
                        const isNotified = notifiedEvents.includes(event.id);
                        const isRepeating = event.repeat.type !== 'none';

                        return (
                          <Box
                            key={event.id}
                            data-testid={`event-box-${event.id}`}
                            draggable={event.repeat.type === 'none'}
                            onDragStart={(e) => handleDragStart(e, event)}
                            sx={{
                              ...eventBoxStyles.common,
                              ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
                              cursor: event.repeat.type === 'none' ? 'move' : 'default',
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              {isNotified && <Notifications fontSize="small" />}
                              {isRepeating && (
                                <Tooltip
                                  title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                                    event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                                  }`}
                                >
                                  <Repeat fontSize="small" />
                                </Tooltip>
                              )}
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                              >
                                {event.title}
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      })}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];

                    const cellDate = day
                      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      : null;

                    return (
                      <TableCell
                        key={dayIndex}
                        data-testid={
                          cellDate ? `month-cell-${cellDate.toISOString().split('T')[0]}` : undefined
                        }
                        onClick={() => cellDate && onCellClick && onCellClick(cellDate)}
                        onDragOver={cellDate ? onDragOver : undefined}
                        onDrop={
                          cellDate && onDrop
                            ? (e) => onDrop(e, cellDate.toISOString().split('T')[0])
                            : undefined
                        }
                        sx={{
                          height: '120px',
                          verticalAlign: 'top',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: day ? 'pointer' : 'default',
                          '&:hover': day
                            ? {
                                backgroundColor: '#f5f5f5',
                              }
                            : {},
                        }}
                      >
                        {day && (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            {getEventsForDay(events, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              const isRepeating = event.repeat.type !== 'none';

                              return (
                                <Box
                                  key={event.id}
                                  data-testid={`event-box-${event.id}`}
                                  draggable={event.repeat.type === 'none'}
                                  onDragStart={(e) => handleDragStart(e, event)}
                                  sx={{
                                    p: 0.5,
                                    my: 0.5,
                                    backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                    borderRadius: 1,
                                    fontWeight: isNotified ? 'bold' : 'normal',
                                    color: isNotified ? '#d32f2f' : 'inherit',
                                    minHeight: '18px',
                                    width: '100%',
                                    overflow: 'hidden',
                                    cursor: event.repeat.type === 'none' ? 'move' : 'default',
                                  }}
                                >
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {isNotified && <Notifications fontSize="small" />}
                                    {isRepeating && (
                                      <Tooltip
                                        title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                                          event.repeat.endDate
                                            ? ` (종료: ${event.repeat.endDate})`
                                            : ''
                                        }`}
                                      >
                                        <Repeat fontSize="small" />
                                      </Tooltip>
                                    )}
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                    >
                                      {event.title}
                                    </Typography>
                                  </Stack>
                                </Box>
                              );
                            })}
                          </>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  return view === 'week' ? renderWeekView() : renderMonthView();
};

export default CalendarView;
