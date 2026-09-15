/**
 * Formatting utilities for display
 */

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format price/quote
 */
export function formatPrice(value: number | string, decimals: number = 3): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format timestamp for display
 */
export function formatTime(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: string | number): string {
  const now = new Date();
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp * 1000);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format confidence level with color class
 */
export function formatConfidence(confidence: number): {
  text: string;
  class: string;
} {
  if (confidence >= 80) {
    return { text: 'Very High', class: 'text-trading-green' };
  }
  if (confidence >= 60) {
    return { text: 'High', class: 'text-trading-blue' };
  }
  if (confidence >= 40) {
    return { text: 'Moderate', class: 'text-trading-amber' };
  }
  return { text: 'Low', class: 'text-trading-red' };
}

/**
 * Format signal status with styling
 */
export function formatSignalStatus(status: string): {
  text: string;
  class: string;
} {
  switch (status) {
    case 'WIN':
      return { text: 'WIN ✓', class: 'text-trading-green bg-trading-green/10' };
    case 'LOSS':
      return { text: 'LOSS ✗', class: 'text-trading-red bg-trading-red/10' };
    case 'PENDING':
      return { text: 'PENDING', class: 'text-trading-amber bg-trading-amber/10' };
    case 'INVALID':
      return { text: 'INVALID', class: 'text-gray-500 bg-gray-500/10' };
    default:
      return { text: status, class: 'text-gray-400' };
  }
}

/**
 * Format connection status
 */
export function formatConnectionStatus(status: string): {
  text: string;
  class: string;
  dot: string;
} {
  switch (status) {
    case 'connected':
      return {
        text: 'Connected',
        class: 'text-trading-green',
        dot: 'bg-trading-green'
      };
    case 'connecting':
      return {
        text: 'Connecting',
        class: 'text-trading-amber',
        dot: 'bg-trading-amber animate-pulse'
      };
    case 'disconnected':
      return {
        text: 'Disconnected',
        class: 'text-trading-red',
        dot: 'bg-trading-red'
      };
    case 'demo':
      return {
        text: 'Demo Mode',
        class: 'text-blue-400',
        dot: 'bg-blue-400'
      };
    default:
      return {
        text: 'Unknown',
        class: 'text-gray-500',
        dot: 'bg-gray-500'
      };
  }
}
