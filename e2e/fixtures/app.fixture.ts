import { test as base } from '@playwright/test';
import { AppTestContext } from '../helpers/AppTestContext';

/**
 * 공통 테스트 픽스처 - appFixture
 *
 * 모든 E2E 테스트에서 사용하는 기본 픽스처
 *
 * 사용법:
 * ```typescript
 * import { test } from '../fixtures/app.fixture';
 *
 * test('test name', async ({ page, appContext }) => {
 *   await appContext.initialize();
 *   // ... 테스트 코드
 *   await appContext.cleanup();
 * });
 * ```
 */

interface AppFixtures {
  appContext: AppTestContext;
}

export const test = base.extend<AppFixtures>({
  appContext: async ({ page }, use) => {
    // Setup: AppTestContext 생성 및 초기화
    const appContext = new AppTestContext(page);
    await appContext.initialize();

    // 테스트 실행
    await use(appContext);

    // Teardown: 정리
    await appContext.cleanup();
  },
});

export { expect } from '@playwright/test';
