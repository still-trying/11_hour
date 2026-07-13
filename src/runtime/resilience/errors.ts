/**
 * 11_HOUR - Failure Classification & Custom Error Types
 *
 * This file defines strongly-typed custom error classes for all failure domains,
 * implements a correlation ID generator, and provides a classification utility
 * to normalize arbitrary runtime exceptions.
 */

export enum FailureCategory {
  RUNTIME = 'RUNTIME',
  NETWORK = 'NETWORK',
  FIREBASE = 'FIREBASE',
  AI = 'AI',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',         // Degradable, auto-healable, no UI interruption
  MEDIUM = 'MEDIUM',   // Needs UI toast or user retry button
  HIGH = 'HIGH',       // Requires partial fallback (e.g. static template)
  FATAL = 'FATAL',     // Completely breaks the view, requires Global Fallback UI
}

export interface ErrorDetails {
  timestamp: string;
  correlationId: string;
  category: FailureCategory;
  severity: ErrorSeverity;
  originalError?: unknown;
  context?: Record<string, any>;
}

/**
 * Generates a unique pseudo-correlation ID for telemetry and diagnostic grouping.
 */
export function generateCorrelationId(): string {
  const segment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `ERR-${segment()}-${segment()}-${segment()}`.toUpperCase();
}

/**
 * Base Resilience Error from which all failure domain errors extend.
 */
export class BaseResilienceError extends Error {
  public readonly correlationId: string;
  public readonly timestamp: string;
  public readonly category: FailureCategory;
  public readonly severity: ErrorSeverity;
  public readonly details?: Record<string, any>;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    category: FailureCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    originalError?: unknown,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'BaseResilienceError';
    this.correlationId = generateCorrelationId();
    this.timestamp = new Date().toISOString();
    this.category = category;
    this.severity = severity;
    this.originalError = originalError;
    this.details = details;

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): ErrorDetails {
    return {
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      category: this.category,
      severity: this.severity,
      context: this.details,
    };
  }
}

export class RuntimeError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.RUNTIME, ErrorSeverity.HIGH, originalError, details);
    this.name = 'RuntimeError';
  }
}

export class NetworkError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.NETWORK, ErrorSeverity.MEDIUM, originalError, details);
    this.name = 'NetworkError';
  }
}

export class FirebaseError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.FIREBASE, ErrorSeverity.HIGH, originalError, details);
    this.name = 'FirebaseError';
  }
}

export class AIError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.AI, ErrorSeverity.HIGH, originalError, details);
    this.name = 'AIError';
  }
}

export class ValidationError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.VALIDATION, ErrorSeverity.LOW, originalError, details);
    this.name = 'ValidationError';
  }
}

export class PermissionError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.PERMISSION, ErrorSeverity.FATAL, originalError, details);
    this.name = 'PermissionError';
  }
}

export class UnknownError extends BaseResilienceError {
  constructor(message: string, originalError?: unknown, details?: Record<string, any>) {
    super(message, FailureCategory.UNKNOWN, ErrorSeverity.FATAL, originalError, details);
    this.name = 'UnknownError';
  }
}

/**
 * Failure Classification System
 * Analyzes arbitrary exceptions and normalizes them into strongly typed Resilience Errors.
 */
export function classifyError(error: unknown): BaseResilienceError {
  if (error instanceof BaseResilienceError) {
    return error;
  }

  const errMessage = error instanceof Error ? error.message : String(error);
  const errName = error instanceof Error ? error.name : 'UnknownException';

  // 1. Check for Firestore Error Info JSON pattern (re-thrown by handleFirestoreError)
  if (typeof errMessage === 'string' && errMessage.includes('operationType') && errMessage.includes('authInfo')) {
    try {
      const parsed = JSON.parse(errMessage);
      const isPermission = parsed.error && (
        parsed.error.includes('permission-denied') || 
        parsed.error.includes('Permission denied') ||
        parsed.error.toLowerCase().includes('permission')
      );
      
      if (isPermission) {
        return new PermissionError(`Firebase Database access denied: ${parsed.error}`, error, parsed);
      }
      return new FirebaseError(`Firebase operation failed: ${parsed.error}`, error, parsed);
    } catch {
      // JSON parsing failed, fall back to standard checks
    }
  }

  // 2. Check for explicit permission denied keywords
  if (
    errMessage.includes('permission-denied') ||
    errMessage.includes('Permission denied') ||
    errMessage.includes('unauthorized') ||
    errMessage.includes('auth/unauthorized') ||
    errMessage.toLowerCase().includes('forbidden')
  ) {
    return new PermissionError(`Access denied: ${errMessage}`, error);
  }

  // 3. Check for typical network / fetch issues
  if (
    errMessage.toLowerCase().includes('failed to fetch') ||
    errMessage.toLowerCase().includes('networkerror') ||
    errMessage.toLowerCase().includes('timeout') ||
    errMessage.toLowerCase().includes('internet') ||
    errMessage.toLowerCase().includes('connection') ||
    errMessage.toLowerCase().includes('cors') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return new NetworkError(`Network connection failure: ${errMessage}`, error);
  }

  // 4. Check for Firebase Auth/Firestore SDK errors
  if (
    errMessage.includes('auth/') ||
    errMessage.includes('firestore') ||
    errMessage.includes('storage/') ||
    errName.includes('FirebaseError')
  ) {
    return new FirebaseError(`Cloud infrastructure error: ${errMessage}`, error);
  }

  // 5. Check for Zod / validation library structures
  if (
    errName === 'ZodError' ||
    errMessage.toLowerCase().includes('validation') ||
    errMessage.toLowerCase().includes('invalid type') ||
    errMessage.toLowerCase().includes('schema validation')
  ) {
    return new ValidationError(`Data schema validation failed: ${errMessage}`, error);
  }

  // 6. Check for AI / Gemini model-specific flags
  if (
    errMessage.includes('Gemini') ||
    errMessage.includes('GoogleGenAI') ||
    errMessage.toLowerCase().includes('model') ||
    errMessage.toLowerCase().includes('api_key') ||
    errMessage.toLowerCase().includes('quota') ||
    errMessage.toLowerCase().includes('rate limit')
  ) {
    return new AIError(`AI generation failure: ${errMessage}`, error);
  }

  // 7. Check if it's a standard JS runtime error (e.g. ReferenceError, TypeError)
  if (
    error instanceof TypeError ||
    error instanceof ReferenceError ||
    error instanceof RangeError ||
    error instanceof SyntaxError
  ) {
    return new RuntimeError(`System execution exception: ${errMessage}`, error);
  }

  // 8. Unknown/Unclassified Fallback
  return new UnknownError(`An unrecognized system error occurred: ${errMessage}`, error);
}
