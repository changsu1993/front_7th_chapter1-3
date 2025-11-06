/**
 * Stability Configuration
 * 테스트 안정성을 위한 타임아웃 및 재시도 설정
 */

export const StabilityConfig = {
  /**
   * 타임아웃 설정 (밀리초)
   * - 빠른 작업: 1-2초
   * - 일반 작업: 5-10초
   * - 느린 작업: 15-30초
   */
  timeouts: {
    // UI 상호작용
    instant: 1000, // 버튼 클릭, 입력 등
    quick: 3000, // 팝업, 다이얼로그 표시
    normal: 5000, // 목록 로드, API 응답
    extended: 10000, // 페이지 로드, 복잡한 작업
    long: 30000, // 파일 업로드, 대용량 작업

    // 네트워크
    networkIdle: 10000,
    apiResponse: 5000,

    // DOM
    domStability: 2000,
    elementVisible: 3000,
    elementHidden: 3000,
  },

  /**
   * 재시도 설정
   */
  retries: {
    // 작업별 최대 재시도 횟수
    click: 3,
    fill: 2,
    navigation: 2,
    apiCall: 3,
    assertion: 2,

    // 전체 테스트 재시도
    testRetries: 1,
  },

  /**
   * 대기 간격 설정
   */
  intervals: {
    // 폴링 간격
    polling: 100, // 100ms마다 조건 확인
    stability: 200, // DOM 안정화 확인 간격
    retry: 500, // 재시도 전 대기

    // 네트워크 회복
    networkReconnect: 1000,
  },

  /**
   * 플래키 테스트 감지 및 로깅
   */
  flakiness: {
    enabled: true,
    logFlakyTests: true,
    slowTestThreshold: 10000, // 10초 이상은 느린 테스트로 간주
    retryFlakyTests: true,
  },

  /**
   * 대기 전략
   */
  strategies: {
    // 요소 대기 전략
    elementWait: 'stable', // 'immediate' | 'visible' | 'stable'

    // 네트워크 대기 전략
    networkWait: 'idleWithTimeout', // 'strict' | 'idle' | 'idleWithTimeout'

    // DOM 안정화
    domWait: 'content', // 'immediate' | 'visible' | 'content' | 'stable'
  },

  /**
   * 재시도 정책
   */
  retryPolicy: {
    enabled: true,
    strategy: 'exponential', // 'fixed' | 'linear' | 'exponential'
    baseDelay: 500, // ms
    maxDelay: 5000, // ms
    maxAttempts: 3,
  },

  /**
   * 에러 핸들링
   */
  errorHandling: {
    ignoreNetworkErrors: false,
    ignoreTimeoutErrors: false,
    softAssertions: false, // true면 실패해도 계속 진행
  },

  /**
   * 로깅 설정
   */
  logging: {
    enabled: true,
    level: 'info', // 'debug' | 'info' | 'warn' | 'error'
    captureScreenshots: true,
    captureDOM: true,
    captureNetworkLogs: false,
  },
};

/**
 * 빠른 대기 프리셋
 */
export const FastWaitPreset = {
  element: 2000,
  network: 5000,
  stability: 1000,
};

/**
 * 느린 네트워크 프리셋
 */
export const SlowNetworkPreset = {
  element: 10000,
  network: 30000,
  stability: 3000,
};

/**
 * 엄격한 모드 프리셋 (모든 것을 기다림)
 */
export const StrictModePreset = {
  element: 15000,
  network: 30000,
  stability: 5000,
  retries: 3,
};

/**
 * 린(Lean) 모드 프리셋 (빠르지만 덜 안정적)
 */
export const LeanModePreset = {
  element: 2000,
  network: 3000,
  stability: 500,
  retries: 1,
};
