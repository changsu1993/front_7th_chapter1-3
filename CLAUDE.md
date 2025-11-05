# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React calendar application with event management, recurring events, notifications, and drag-and-drop functionality. The app uses Material-UI for components, Express for the backend API, and Vitest for testing.

## Development Commands

### Running the Application
- `pnpm dev` - Start both the Express server (port 3000) and Vite dev server concurrently
- `pnpm server` - Run Express server only
- `pnpm server:watch` - Run Express server with auto-reload
- `pnpm start` - Start Vite dev server only

### Testing
- `pnpm test` - Run tests in watch mode
- `pnpm test:ui` - Run tests with Vitest UI
- `pnpm test:coverage` - Generate test coverage report (outputs to `.coverage/`)

### Build and Lint
- `pnpm build` - TypeScript compilation and Vite build
- `pnpm lint` - Run both ESLint and TypeScript checks
- `pnpm lint:eslint` - Run ESLint only
- `pnpm lint:tsc` - Run TypeScript type checking only

## Architecture

### Backend (server.js)
- Simple Express server on port 3000
- REST API endpoints: GET/POST `/api/events`, PUT/DELETE `/api/events/:id`
- Data persistence using JSON files in `src/__mocks__/response/`
- Uses `realEvents.json` for dev, `e2e.json` when `TEST_ENV=e2e`

### Frontend Structure
- **App.tsx**: Main component containing all UI and event management logic
- **hooks/**: Custom React hooks for feature separation
  - `useEventOperations.ts` - Event CRUD operations with API calls
  - `useEventForm.ts` - Form state management
  - `useCalendarView.ts` - Calendar navigation and view switching (week/month)
  - `useNotifications.ts` - Notification system logic
  - `useRecurringEventOperations.ts` - Recurring event edit/delete logic
  - `useSearch.ts` - Event search and filtering
- **utils/**: Pure utility functions
  - `dateUtils.ts` - Date formatting, week/month calculations
  - `eventUtils.ts` - Event manipulation utilities
  - `eventOverlap.ts` - Overlap detection between events
  - `timeValidation.ts` - Time validation logic
  - `generateRepeatEvents.ts` - Generate recurring event instances
  - `notificationUtils.ts` - Notification time calculations
- **types.ts**: TypeScript interfaces (Event, EventForm, RepeatInfo, RepeatType)
- **components/**: Reusable React components
  - `RecurringEventDialog.tsx` - Dialog for editing/deleting recurring events

### Key Features
1. **Event Management**: Create, read, update, delete events with validation
2. **Recurring Events**: Support for daily, weekly, monthly, yearly repeats with intervals
3. **Notifications**: Alert system based on notification time settings
4. **Calendar Views**: Switch between week and month views
5. **Event Overlap Detection**: Warns when events overlap in time
6. **Search and Filter**: Search events by various fields

### Data Flow
- Events fetched from Express API on component mount
- Local state managed through custom hooks
- Form submissions trigger API calls (POST/PUT) then refetch events
- Recurring events stored with `repeat` object, instances generated client-side

### Testing Setup
- Vitest with jsdom environment
- Setup file: `src/setupTests.ts`
- MSW for API mocking in tests (`src/__mocks__/handlers.ts`)
- Test categories:
  - `__tests__/unit/` - Pure function tests
  - `__tests__/hooks/` - React hook tests
  - `__tests__/integration/` - Integration tests
  - `__tests__/components/` - Component tests
  - `__tests__/edge-cases/` - Edge case scenarios
  - `__tests__/regression/` - Regression tests

## Important Implementation Details

### Recurring Event Handling
- Recurring events have a non-'none' `repeat.type` and `repeat.interval > 0`
- Editing/deleting recurring events shows a dialog asking "single instance" vs "all instances"
- Single instance edits use `recurringEditMode` state to track edit scope
- The `handleRecurringEdit` and `handleRecurringDelete` functions in `useRecurringEventOperations` handle the logic

### Event Overlap
- The `findOverlappingEvents` function checks for time conflicts on the same date
- Overlap dialog appears before saving, allowing user to proceed or cancel

### Time Validation
- Start time must be before end time
- Validation errors displayed as tooltips on time input fields
- Error state prevents form submission

### API Proxy
- Vite dev server proxies `/api` requests to `http://localhost:3000`
- Configured in `vite.config.ts`

## Assignment Context
This is assignment 3 (과제 3) for a course, focusing on:
- Drag and drop functionality for moving events between dates/times
- Click-to-create events on empty calendar cells
- E2E tests for workflows (basic events, recurring events, overlap handling, notifications, search/filter)
- Visual regression tests for calendar views, event states, dialogs, form controls, text overflow handling
