import { TickData } from '../types';

/**
 * TickService
 * Manages tick history with rolling buffer pattern
 */

class TickService {
  private ticks: TickData[] = [];
  private maxSize: number = 1000;
  private lastDigits: number[] = [];

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * Add a tick to history
   */
  addTick(tick: TickData): void {
    this.ticks.push(tick);
    this.lastDigits.push(tick.lastDigit);

    // Maintain rolling buffer
    if (this.ticks.length > this.maxSize) {
      this.ticks.shift();
      this.lastDigits.shift();
    }
  }

  /**
   * Get all ticks
   */
  getTicks(): TickData[] {
    return [...this.ticks];
  }

  /**
   * Get ticks for a specific window size
   */
  getTicksWindow(windowSize: number): TickData[] {
    if (windowSize >= this.ticks.length) {
      return [...this.ticks];
    }
    return this.ticks.slice(-windowSize);
  }

  /**
   * Get last N digits
   */
  getLastDigits(count?: number): number[] {
    if (!count || count >= this.lastDigits.length) {
      return [...this.lastDigits];
    }
    return this.lastDigits.slice(-count);
  }

  /**
   * Get last tick
   */
  getLastTick(): TickData | null {
    if (this.ticks.length === 0) return null;
    return this.ticks[this.ticks.length - 1];
  }

  /**
   * Get tick count
   */
  getCount(): number {
    return this.ticks.length;
  }

  /**
   * Clear all ticks
   */
  clear(): void {
    this.ticks = [];
    this.lastDigits = [];
  }

  /**
   * Check if we have minimum data
   */
  hasMinimumData(minimumSize: number): boolean {
    return this.ticks.length >= minimumSize;
  }

  /**
   * Get memory usage estimate (bytes)
   */
  getMemoryUsage(): number {
    // Rough estimate: each tick ~200 bytes
    return this.ticks.length * 200;
  }
}

// Singleton instance
let instance: TickService | null = null;

/**
 * Get or create TickService instance
 */
export function getTickService(): TickService {
  if (!instance) {
    instance = new TickService();
  }
  return instance;
}

export default TickService;
