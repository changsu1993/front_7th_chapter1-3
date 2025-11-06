import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정
 * E2E 테스트 및 시각적 회귀 테스트를 위한 설정
 */
export default defineConfig({
  testDir: './e2e',

  // 테스트 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 리포트 설정
  reporter: 'html',

  use: {
    // 기본 URL
    baseURL: 'http://localhost:5173',

    // 스크린샷 및 비디오 설정
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  // 테스트할 브라우저 프로젝트
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 웹서버 설정: 테스트 실행 전에 dev 서버 자동 실행
  webServer: {
    command: 'TEST_ENV=e2e pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
