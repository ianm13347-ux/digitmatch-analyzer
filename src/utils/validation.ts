import { TickData, Signal, UserPreferences } from '../types';

/**
 * Validation utilities for data integrity
 */

/**
 * Validate a TickData object
 */
export function validateTickData(tick: Partial<TickData>): tick is TickData {
  return (
    typeof tick.id === 'string' &&
    typeof tick.symbol === 'string' &&
    typeof tick.quote === 'string' &&
    typeof tick.timestamp === 'string' &&
    typeof tick.epoch === 'number' &&
    typeof tick.lastDigit === 'number' &&
    tick.lastDigit >= 0 &&
    tick.lastDigit <= 9
  );
}

/**
 * Validate a Signal object
 */
export function validateSignal(signal: Partial<Signal>): signal is Signal {
  return (
    typeof signal.id === 'string' &&
    typeof signal.symbol === 'string' &&
    (signal.predictedDigit === null || (typeof signal.predictedDigit === 'number' && signal.predictedDigit >= 0 && signal.predictedDigit <= 9)) &&
    typeof signal.confidence === 'number' &&
    signal.confidence >= 0 &&
    signal.confidence <= 100 &&
    typeof signal.sampleSize === 'number' &&
    signal.sampleSize > 0 &&
    typeof signal.timestamp === 'string' &&
    typeof signal.epoch === 'number' &&
    ['PENDING', 'WIN', 'LOSS', 'INVALID'].includes(signal.status) &&
    typeof signal.explanation === 'string' &&
    typeof signal.modelVersion === 'string'
  );
}

/**
 * Validate user preferences
 */
export function validateUserPreferences(prefs: Partial<UserPreferences>): prefs is UserPreferences {
  return (
    typeof prefs.selectedMarket === 'string' &&
    typeof prefs.analysisWindow === 'number' &&
    [50, 100, 250, 500, 1000].includes(prefs.analysisWindow) &&
    typeof prefs.minimumSampleSize === 'number' &&
    prefs.minimumSampleSize > 0 &&
    typeof prefs.signalThreshold === 'number' &&
    prefs.signalThreshold >= 0 &&
    prefs.signalThreshold <= 100 &&
    typeof prefs.hotDigitThreshold === 'number' &&
    typeof prefs.coldDigitThreshold === 'number' &&
    typeof prefs.autoRefresh === 'boolean' &&
    typeof prefs.soundNotifications === 'boolean' &&
    ['dark', 'light'].includes(prefs.theme) &&
    typeof prefs.dataRetentionDays === 'number' &&
    prefs.dataRetentionDays > 0
  );
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain a number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize a string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate market symbol format
 */
export function validateMarketSymbol(symbol: string): boolean {
  // Market symbols are typically all uppercase, alphanumeric
  return /^[A-Z0-9_]{2,10}$/.test(symbol);
}

/**
 * Validate analysis window size
 */
export function validateWindowSize(size: number): boolean {
  return [50, 100, 250, 500, 1000].includes(size);
}
