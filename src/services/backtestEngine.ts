import { Signal, BacktestResult, BacktestMetrics, TickData } from '../types';
import { calculateDigitStats } from '../utils/statistics';
import { SignalEngine } from './signalEngine';

/**
 * BacktestEngine
 * Performs walk-forward historical validation
 * Prevents look-ahead bias
 */

class BacktestEngine {
  /**
   * Run backtest on historical data
   * Implements walk-forward validation
   */
  runBacktest(
    ticks: TickData[],
    symbol: string,
    windowSize: number = 250,
    trainingRatio: number = 0.7
  ): BacktestResult {
    if (ticks.length < windowSize * 2) {
      throw new Error('Insufficient data for backtesting');
    }

    // Split data chronologically (no future knowledge)
    const splitIndex = Math.floor(ticks.length * trainingRatio);
    const trainingTicks = ticks.slice(0, splitIndex);
    const testingTicks = ticks.slice(splitIndex);

    // Additional validation split
    const validationSplitIndex = Math.floor(trainingTicks.length * 0.8);
    const actualTraining = trainingTicks.slice(0, validationSplitIndex);
    const validationTicks = trainingTicks.slice(validationSplitIndex);

    const signals: Signal[] = [];
    const engine = new SignalEngine();

    // Generate signals on test data without using future information
    // For each test tick, only use data up to that point
    const testDigits = testingTicks.map(t => t.lastDigit);

    for (let i = windowSize; i < testDigits.length; i++) {
      // Only use data up to current point (no look-ahead)
      const historicalDigits = testDigits.slice(Math.max(0, i - windowSize), i);
      const signal = engine.generateSignal(symbol, historicalDigits, windowSize);

      if (signal) {
        // Check result from NEXT tick
        if (i < testDigits.length) {
          const actualDigit = testDigits[i];
          engine.recordResult(signal, actualDigit);
          signals.push(signal);
        }
      }
    }

    const metrics = this.calculateMetrics(signals);
    const performanceByDigit = this.calculatePerformanceByDigit(signals);
    const performanceByWindow = this.calculatePerformanceByWindow(signals, windowSize);

    return {
      symbol,
      period: {
        start: ticks[0].timestamp,
        end: ticks[ticks.length - 1].timestamp
      },
      dataSet: {
        training: actualTraining.length,
        validation: validationTicks.length,
        testing: testingTicks.length
      },
      metrics,
      performanceByDigit,
      performanceByWindow,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculateMetrics(signals: Signal[]): BacktestMetrics {
    const pending = signals.filter(s => s.status === 'PENDING').length;
    const completed = signals.filter(s => s.status !== 'PENDING' && s.status !== 'INVALID');
    const successful = completed.filter(s => s.status === 'WIN');
    const unsuccessful = completed.filter(s => s.status === 'LOSS');

    const accuracy =
      completed.length > 0
        ? (successful.length / completed.length) * 100
        : 0;

    // Calculate streaks
    const { maxWins, maxLosses, currentWins, currentLosses } = this.calculateStreaks(signals);

    // Recent accuracy windows
    const recentAccuracy10 = this.calculateWindowAccuracy(signals, 10);
    const recentAccuracy50 = this.calculateWindowAccuracy(signals, 50);
    const recentAccuracy100 = this.calculateWindowAccuracy(signals, 100);

    return {
      totalSignals: signals.length,
      successfulSignals: successful.length,
      unsuccessfulSignals: unsuccessful.length,
      pendingSignals: pending,
      accuracy,
      precision: successful.length > 0 ? successful.length / signals.length : 0,
      recall: successful.length > 0 ? successful.length / (successful.length + unsuccessful.length) : 0,
      winStreak: currentWins,
      lossStreak: currentLosses,
      maxConsecutiveWins: maxWins,
      maxConsecutiveLosses: maxLosses,
      recentAccuracy10,
      recentAccuracy50,
      recentAccuracy100
    };
  }

  /**
   * Calculate performance by digit
   */
  private calculatePerformanceByDigit(
    signals: Signal[]
  ): Record<number, { total: number; wins: number; accuracy: number }> {
    const performance: Record<number, { total: number; wins: number; accuracy: number }> = {};

    for (let i = 0; i < 10; i++) {
      performance[i] = { total: 0, wins: 0, accuracy: 0 };
    }

    signals
      .filter(s => s.predictedDigit !== null && s.status !== 'PENDING' && s.status !== 'INVALID')
      .forEach(s => {
        const digit = s.predictedDigit!;
        performance[digit].total++;
        if (s.status === 'WIN') {
          performance[digit].wins++;
        }
      });

    for (let i = 0; i < 10; i++) {
      if (performance[i].total > 0) {
        performance[i].accuracy = (performance[i].wins / performance[i].total) * 100;
      }
    }

    return performance;
  }

  /**
   * Calculate performance by window size
   */
  private calculatePerformanceByWindow(
    signals: Signal[],
    windowSize: number
  ): Record<number, BacktestMetrics> {
    const windowSizes = [50, 100, 250, 500];
    const performance: Record<number, BacktestMetrics> = {};

    windowSizes.forEach(size => {
      const windowSignals = signals.filter(s => s.analysisWindow >= size);
      performance[size] = this.calculateMetrics(windowSignals);
    });

    return performance;
  }

  /**
   * Calculate win/loss streaks
   */
  private calculateStreaks(
    signals: Signal[]
  ): { maxWins: number; maxLosses: number; currentWins: number; currentLosses: number } {
    let maxWins = 0;
    let maxLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;
    let lastStreak: 'win' | 'loss' | null = null;

    signals
      .filter(s => s.status !== 'PENDING' && s.status !== 'INVALID')
      .forEach(s => {
        const isWin = s.status === 'WIN';
        const streak = isWin ? 'win' : 'loss';

        if (streak === lastStreak) {
          if (isWin) {
            currentWins++;
            maxWins = Math.max(maxWins, currentWins);
          } else {
            currentLosses++;
            maxLosses = Math.max(maxLosses, currentLosses);
          }
        } else {
          currentWins = isWin ? 1 : 0;
          currentLosses = isWin ? 0 : 1;
          lastStreak = streak;
        }
      });

    return { maxWins, maxLosses, currentWins, currentLosses };
  }

  /**
   * Calculate accuracy over a recent window
   */
  private calculateWindowAccuracy(signals: Signal[], windowSize: number): number {
    const recentSignals = signals
      .slice(-windowSize)
      .filter(s => s.status !== 'PENDING' && s.status !== 'INVALID');

    if (recentSignals.length === 0) return 0;

    const wins = recentSignals.filter(s => s.status === 'WIN').length;
    return (wins / recentSignals.length) * 100;
  }
}

// Singleton instance
let instance: BacktestEngine | null = null;

/**
 * Get or create BacktestEngine instance
 */
export function getBacktestEngine(): BacktestEngine {
  if (!instance) {
    instance = new BacktestEngine();
  }
  return instance;
}

export default BacktestEngine;
