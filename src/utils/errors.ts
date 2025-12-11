// src/utils/errors.ts

export class GarminAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'GarminAPIError';
  }
}

export class AuthenticationError extends GarminAPIError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message, 401, false);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends GarminAPIError {
  constructor(public retryAfter?: number) {
    super('RATE_LIMIT', 'Rate limit exceeded', 429, true);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export function isFatalError(error: unknown): boolean {
  if (error instanceof AuthenticationError) return true;
  if (error instanceof ValidationError) return true;
  if (error instanceof GarminAPIError && !error.retryable) return true;
  return false;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error instanceof GarminAPIError && error.retryable) return true;
  if (error instanceof Error && error.message.includes('ECONNRESET')) return true;
  if (error instanceof Error && error.message.includes('ETIMEDOUT')) return true;
  return false;
}
