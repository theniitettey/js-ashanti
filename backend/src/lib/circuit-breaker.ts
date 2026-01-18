/**
 * Circuit Breaker Pattern Implementation
 * Protects against cascading failures in external APIs (OpenAI)
 *
 * States: CLOSED → OPEN → HALF-OPEN → CLOSED
 * - CLOSED: Requests pass through normally
 * - OPEN: Requests fail immediately (fast fail, protects API)
 * - HALF-OPEN: One test request allowed to check if API recovered
 */

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number; // Failures before OPEN
  cooldownMs: number; // Time before attempting HALF_OPEN
  halfOpenMaxRequests: number; // Requests allowed in HALF_OPEN state
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastStateChange: Date;
  lastFailureTime?: Date;
}

class CircuitBreaker {
  private state: CircuitBreakerState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private halfOpenRequests = 0;
  private lastStateChange = new Date();
  private lastFailureTime?: Date;
  private cooldownTimer?: NodeJS.Timeout;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute a function with circuit breaker protection
   * Throws CircuitBreakerOpenError if circuit is OPEN
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      throw new CircuitBreakerOpenError(
        `Circuit breaker is OPEN. Cooling down until ${new Date(
          this.lastFailureTime!.getTime() + this.config.cooldownMs
        ).toISOString()}`
      );
    }

    if (this.state === "HALF_OPEN") {
      if (this.halfOpenRequests >= this.config.halfOpenMaxRequests) {
        throw new CircuitBreakerOpenError(
          "Circuit breaker HALF_OPEN: max test requests exceeded"
        );
      }
      this.halfOpenRequests++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      // API recovered, return to CLOSED
      this.transitionTo("CLOSED");
      this.failureCount = 0;
      this.successCount = 0;
      this.halfOpenRequests = 0;
    } else if (this.state === "CLOSED") {
      this.successCount++;
    }
  }

  private onFailure(): void {
    this.lastFailureTime = new Date();

    if (this.state === "HALF_OPEN") {
      // Test failed, back to OPEN
      this.transitionTo("OPEN");
      this.startCooldown();
    } else if (this.state === "CLOSED") {
      this.failureCount++;
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionTo("OPEN");
        this.startCooldown();
      }
    }
  }

  private transitionTo(newState: CircuitBreakerState): void {
    if (this.state !== newState) {
      console.log(
        `[CircuitBreaker] State transition: ${this.state} → ${newState}`
      );
      this.state = newState;
      this.lastStateChange = new Date();
    }
  }

  private startCooldown(): void {
    if (this.cooldownTimer) clearTimeout(this.cooldownTimer);

    this.cooldownTimer = setTimeout(() => {
      this.transitionTo("HALF_OPEN");
      this.halfOpenRequests = 0;
      console.log(
        "[CircuitBreaker] Entering HALF_OPEN state for recovery test"
      );
    }, this.config.cooldownMs);
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: this.lastStateChange,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Reset circuit breaker (for testing or admin intervention)
   */
  reset(): void {
    if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenRequests = 0;
    this.lastStateChange = new Date();
    this.lastFailureTime = undefined;
    console.log("[CircuitBreaker] Manually reset to CLOSED");
  }

  /**
   * Get current state (for debugging)
   */
  getState(): CircuitBreakerState {
    return this.state;
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * Global circuit breaker instance for AI service
 * Configuration based on production spec:
 * - 5 failures before OPEN
 * - 10 minutes cooldown
 * - 1 test request in HALF_OPEN
 */
export const aiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  cooldownMs: 10 * 60 * 1000, // 10 minutes
  halfOpenMaxRequests: 1,
});

export default CircuitBreaker;
