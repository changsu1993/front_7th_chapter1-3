import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정
 * E2E 테스트 및 시각적 회귀 테스트를 위한 설정
 *
 * 환경 변수:
 * - SLOW_NETWORK: 느린 네트워크 환경 시뮬레이션
 * - DEBUG: 디버그 모드 활성화
 * - HEADED: 브라우저 UI 표시
 * - WORKERS: 병렬 워커 수
 */

const isCI = !!process.env.CI;
const isDebug = !!process.env.DEBUG;
const isHeaded = !!process.env.HEADED;
const workers = process.env.WORKERS ? parseInt(process.env.WORKERS) : isCI ? 1 : 4;

export default defineConfig({
  testDir: './e2e/tests-refactored',
  testMatch: '**/*.spec.ts',

  // 테스트 실행 설정
  fullyParallel: !isCI, // CI에서는 순차 실행으로 리소스 절약
  forbidOnly: isCI,
  retries: isCI ? 2 : 0, // CI에서만 재시도
  workers: workers, // 로컬: 4개 워커, CI: 1개 워커
  timeout: 30 * 1000, // 30초 타임아웃
  expect: {
    timeout: 10 * 1000, // assertion 타임아웃
  },

  // 리포트 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // 콘솔에 결과 출력
  ],

  use: {
    // 기본 URL
    baseURL: 'http://localhost:5173',

    // 액션 타임아웃 (click, fill, press 등)
    actionTimeout: 10 * 1000,

    // 네비게이션 타임아웃
    navigationTimeout: 30 * 1000,

    // 스크린샷 및 비디오 설정
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    trace: 'retain-on-failure',

    // 느린 네트워크 시뮬레이션
    ...(process.env.SLOW_NETWORK && {
      offline: false,
      // latency와 bandwidth를 통한 네트워크 제한 가능
    }),

    // 헤드리스 모드
    headless: !isHeaded,
  },

  // 테스트할 브라우저 프로젝트
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 개발자 도구 비활성화 (성능 향상)
        launchArgs: ['--disable-dev-shm-usage'],
      },
    },
    // 필요시 Firefox, Safari 추가 가능
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 글로벌 설정
  globalSetup: undefined,
  globalTeardown: undefined,

  // 웹서버 설정: 테스트 실행 전에 dev 서버 자동 실행
  webServer: {
    command: 'TEST_ENV=e2e pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: isDebug ? 'pipe' : 'ignore',
  },

  // 출력 폴더
  outputDir: 'test-results',

  // 스냅샷 설정
  snapshotDir: 'e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{platform}{ext}',
  updateSnapshots: process.env.UPDATE_SNAPSHOTS ? 'all' : 'missing',
});
