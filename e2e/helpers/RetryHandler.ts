/**
 * RetryHandler
 * 실패한 작업을 자동으로 재시도하는 고급 재시도 로직
 * - 지수 백오프 (exponential backoff)
 * - 선택적 에러 필터링
 * - 재시도 통계
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  name?: string;
  verbose?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryStats {
  name: string;
  totalAttempts: number;
  successAttempt: number;
  lastError?: Error;
  totalDurationMs: number;
}

export class RetryHandler {
  private stats: Map<string, RetryStats> = new Map();

  /**
   * 함수를 재시도하여 실행
   */
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 100,
      backoffMultiplier = 2,
      maxDelayMs = 5000,
      name = 'operation',
      verbose = false,
      onRetry,
    } = options;

    const startTime = Date.now();
    let lastError: Error | null = null;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();

        // 성공 시 통계 기록
        this.recordSuccess(name, attempt, Date.now() - startTime);

        if (verbose && attempt > 1) {
          console.log(`✅ ${name}: 재시도 ${attempt - 1}회 후 성공`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          this.recordFailure(name, attempt, lastError, Date.now() - startTime);
          throw error;
        }

        // 재시도 콜백 호출
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        if (verbose) {
          console.warn(
            `⚠️ ${name} 시도 ${attempt}/${maxAttempts} 실패: ${lastError.message}`
          );
        }

        // 지수 백오프로 대기
        const delay = Math.min(currentDelay, maxDelayMs);
        await this.sleep(delay);

        // 다음 시도를 위해 delay 증가
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
      }
    }

    // 도달 불가능한 코드이지만, TypeScript 안전성을 위해
    throw lastError || new Error(`${name} 작업 실패`);
  }

  /**
   * 조건을 만족할 때까지 재시도
   */
  async waitFor(
    condition: () => Promise<boolean>,
    options: RetryOptions = {}
  ): Promise<void> {
    const { maxAttempts = 30, delayMs = 100, name = 'condition' } = options;

    await this.execute(
      async () => {
        if (!(await condition())) {
          throw new Error(`조건이 만족되지 않음: ${name}`);
        }
      },
      { ...options, maxAttempts, delayMs }
    );
  }

  /**
   * 선택적 재시도 (특정 에러만 재시도)
   */
  async executeWithErrorFilter<T>(
    fn: () => Promise<T>,
    errorFilter: (error: Error) => boolean,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delayMs = 100,
      backoffMultiplier = 2,
      maxDelayMs = 5000,
      name = 'operation',
    } = options;

    let lastError: Error | null = null;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 에러가 재시도 불가능한 경우 즉시 실패
        if (!errorFilter(lastError)) {
          throw error;
        }

        // 마지막 시도면 실패
        if (attempt === maxAttempts) {
          throw error;
        }

        // 지수 백오프 대기
        const delay = Math.min(currentDelay, maxDelayMs);
        await this.sleep(delay);
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
      }
    }

    throw lastError;
  }

  /**
   * 동시 작업 재시도 (Promise.all과 유사하지만 재시도 지원)
   */
  async executeAll<T>(
    fns: Array<() => Promise<T>>,
    options: RetryOptions = {}
  ): Promise<T[]> {
    return Promise.all(
      fns.map((fn) =>
        this.execute(fn, {
          ...options,
          name: options.name ? `${options.name}[${fns.indexOf(fn)}]` : undefined,
        })
      )
    );
  }

  /**
   * 통계 조회
   */
  getStats(name?: string): RetryStats | Map<string, RetryStats> {
    if (name) {
      return (
        this.stats.get(name) || {
          name,
          totalAttempts: 0,
          successAttempt: 0,
          totalDurationMs: 0,
        }
      );
    }
    return this.stats;
  }

  /**
   * 통계 리셋
   */
  resetStats(): void {
    this.stats.clear();
  }

  /**
   * 통계 출력
   */
  printStats(): void {
    console.log('\n=== 재시도 통계 ===');

    this.stats.forEach((stat) => {
      const successRate =
        stat.totalAttempts > 0
          ? ((stat.successAttempt / stat.totalAttempts) * 100).toFixed(1)
          : 'N/A';

      console.log(`
${stat.name}:
  - 성공한 시도: ${stat.successAttempt}
  - 총 시도: ${stat.totalAttempts}
  - 성공률: ${successRate}%
  - 평균 소요시간: ${Math.round(stat.totalDurationMs / stat.totalAttempts)}ms
${stat.lastError ? `  - 마지막 에러: ${stat.lastError.message}` : ''}
      `);
    });
  }

  /**
   * 지수 백오프를 사용하여 대기
   */
  async exponentialBackoff(
    attempt: number,
    baseDelayMs: number = 100,
    maxDelayMs: number = 5000
  ): Promise<void> {
    const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
    await this.sleep(delay);
  }

  /**
   * 선형 백오프를 사용하여 대기
   */
  async linearBackoff(
    attempt: number,
    baseDelayMs: number = 100,
    maxDelayMs: number = 5000
  ): Promise<void> {
    const delay = Math.min(baseDelayMs * attempt, maxDelayMs);
    await this.sleep(delay);
  }

  /**
   * 고정 간격으로 대기
   */
  async fixedDelay(delayMs: number): Promise<void> {
    await this.sleep(delayMs);
  }

  /**
   * Private 메서드들
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private recordSuccess(
    name: string,
    attempt: number,
    durationMs: number
  ): void {
    const stat = this.stats.get(name) || {
      name,
      totalAttempts: 0,
      successAttempt: 0,
      totalDurationMs: 0,
    };

    stat.totalAttempts++;
    stat.successAttempt = attempt;
    stat.totalDurationMs += durationMs;

    this.stats.set(name, stat);
  }

  private recordFailure(
    name: string,
    totalAttempts: number,
    lastError: Error,
    durationMs: number
  ): void {
    const stat = this.stats.get(name) || {
      name,
      totalAttempts: 0,
      successAttempt: 0,
      totalDurationMs: 0,
    };

    stat.totalAttempts = totalAttempts;
    stat.lastError = lastError;
    stat.totalDurationMs += durationMs;

    this.stats.set(name, stat);
  }
}

/**
 * 싱글톤 인스턴스
 */
export const globalRetryHandler = new RetryHandler();

/**
 * 편의 함수들
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return globalRetryHandler.execute(fn, { maxAttempts });
}

export async function retryWaitFor(
  condition: () => Promise<boolean>,
  maxAttempts: number = 30
): Promise<void> {
  return globalRetryHandler.waitFor(condition, { maxAttempts });
}
