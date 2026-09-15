import { Signal, SignalComponents, DigitStats } from '../types';
import { calculateDigitStats } from '../utils/statistics';

/**
 * SignalEngine
 * Generates data-driven digit-match signals
 */

interface SignalConfig {
  confidenceThreshold: number; // 0-100
  minimumSampleSize: number;
  frequencyWeight: number;
  recencyWeight: number;
  historyWeight: number;
  patternWeight: number;
  performanceWeight: number;
}

class SignalEngine {
  private config: SignalConfig;
  private historicalAccuracy: Record<number, { total: number; wins: number }> = {};
  private recentPerformance: Array<{ digit: number; result: boolean }> = [];
  private modelVersion = '1.0.0';

  constructor(config?: Partial<SignalConfig>) {
    this.config = {
      confidenceThreshold: 50,
      minimumSampleSize: 50,
      frequencyWeight: 0.3,
      recencyWeight: 0.25,
      historyWeight: 0.2,
      patternWeight: 0.15,
      performanceWeight: 0.1,
      ...config
    };

    // Initialize historical accuracy
    for (let i = 0; i < 10; i++) {
      this.historicalAccuracy[i] = { total: 0, wins: 0 };
    }
  }

  /**
   * Generate a signal based on current analysis
   */
  generateSignal(
    symbol: string,
    digits: number[],
    windowSize: number,
    recentTrend?: number
  ): Signal | null {
    // Validate minimum data
    if (digits.length < this.config.minimumSampleSize) {
      return null; // Insufficient data
    }

    const stats = calculateDigitStats(digits);
    const timestamp = new Date().toISOString();
    const epoch = Math.floor(Date.now() / 1000);

    // Calculate component scores
    const components = this.calculateComponents(stats, digits, recentTrend);
    const totalScore = this.calculateTotalScore(components);

    // Calculate confidence
    const confidence = Math.min(100, Math.max(0, totalScore));

    // Check if signal meets threshold
    if (confidence < this.config.confidenceThreshold) {
      return null; // Weak signal
    }

    // Select predicted digit
    const predictedDigit = stats[0].digit; // Most frequent digit

    // Calculate historical validation
    const historicalValidation = this.calculateHistoricalValidation(predictedDigit);

    const signal: Signal = {
      id: `signal-${epoch}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      predictedDigit,
      confidence: Math.round(confidence * 10) / 10,
      sampleSize: digits.length,
      timestamp,
      epoch,
      status: 'PENDING',
      explanation: this.generateExplanation(stats, components, confidence),
      modelVersion: this.modelVersion,
      analysisWindow: windowSize,
      historicalValidation: Math.round(historicalValidation * 10) / 10,
      components
    };

    return signal;
  }

  /**
   * Calculate individual component scores
   */
  private calculateComponents(
    stats: DigitStats[],
    digits: number[],
    recentTrend?: number
  ): SignalComponents {
    // Frequency component (highest frequency digit)
    const topDigit = stats[0];
    const expectedFrequency = 10; // 10% for fair distribution
    const frequencyComponent = Math.min(100, (topDigit.frequency / expectedFrequency) * 50);

    // Recency component (how recently did it appear?)
    const recencyComponent = Math.max(0, 100 - topDigit.gap * 5);

    // Historical performance component
    const history = this.historicalAccuracy[topDigit.digit];
    const historicalComponent =
      history.total > 0
        ? (history.wins / history.total) * 100
        : 50; // Default if no history

    // Pattern component (based on recent trend)
    const patternComponent = recentTrend ? Math.min(100, Math.abs(recentTrend) * 10) : 50;

    // Model performance component (recent accuracy)
    const performanceComponent = this.calculateModelPerformance();

    return {
      frequencyComponent: Math.round(frequencyComponent * 10) / 10,
      recencyComponent: Math.round(recencyComponent * 10) / 10,
      historyComponent: Math.round(historicalComponent * 10) / 10,
      patternComponent: Math.round(patternComponent * 10) / 10,
      performanceComponent: Math.round(performanceComponent * 10) / 10
    };
  }

  /**
   * Calculate total score from components
   */
  private calculateTotalScore(components: SignalComponents): number {
    return (
      components.frequencyComponent * this.config.frequencyWeight +
      components.recencyComponent * this.config.recencyWeight +
      components.historyComponent * this.config.historyWeight +
      components.patternComponent * this.config.patternWeight +
      components.performanceComponent * this.config.performanceWeight
    );
  }

  /**
   * Calculate historical validation score
   */
  private calculateHistoricalValidation(digit: number): number {
    const history = this.historicalAccuracy[digit];
    if (history.total === 0) {
      return 50; // No history, neutral
    }
    return (history.wins / history.total) * 100;
  }

  /**
   * Calculate current model performance
   */
  private calculateModelPerformance(): number {
    if (this.recentPerformance.length === 0) {
      return 50; // No data
    }

    const recentWindow = this.recentPerformance.slice(-50);
    const wins = recentWindow.filter(p => p.result).length;
    return (wins / recentWindow.length) * 100;
  }

  /**
   * Record signal result
   */
  recordResult(signal: Signal, actualDigit: number): void {
    const isWin = signal.predictedDigit === actualDigit;

    // Update signal status
    signal.status = isWin ? 'WIN' : 'LOSS';
    signal.actualDigit = actualDigit;

    // Update historical accuracy
    if (signal.predictedDigit !== null) {
      this.historicalAccuracy[signal.predictedDigit].total++;
      if (isWin) {
        this.historicalAccuracy[signal.predictedDigit].wins++;
      }
    }

    // Track recent performance
    if (signal.predictedDigit !== null) {
      this.recentPerformance.push({
        digit: signal.predictedDigit,
        result: isWin
      });

      // Keep only recent 1000 results
      if (this.recentPerformance.length > 1000) {
        this.recentPerformance.shift();
      }
    }
  }

  /**
   * Generate explanation text
   */
  private generateExplanation(
    stats: DigitStats[],
    components: SignalComponents,
    confidence: number
  ): string {
    const topDigit = stats[0].digit;
    const frequency = stats[0].frequency.toFixed(1);

    let explanation = `Digit ${topDigit} shows elevated frequency (${frequency}%) in current sample. `;

    if (components.frequencyComponent > 60) {
      explanation += 'Strong frequency signal. ';
    }

    if (components.recencyComponent > 60) {
      explanation += 'Digit appeared recently. ';
    }

    if (confidence < 70) {
      explanation += 'Confidence is moderate - use with caution. ';
    }

    explanation +=
      'This signal is probabilistic and based on historical patterns. It does not guarantee future outcomes.';

    return explanation;
  }

  /**
   * Get model statistics
   */
  getModelStats(): {
    totalSignalsProcessed: number;
    overallAccuracy: number;
    digitAccuracy: Record<number, number>;
  } {
    let totalWins = 0;
    let totalSignals = 0;
    const digitAccuracy: Record<number, number> = {};

    for (let i = 0; i < 10; i++) {
      const history = this.historicalAccuracy[i];
      if (history.total > 0) {
        digitAccuracy[i] = (history.wins / history.total) * 100;
        totalWins += history.wins;
        totalSignals += history.total;
      } else {
        digitAccuracy[i] = 50; // No data
      }
    }

    return {
      totalSignalsProcessed: totalSignals,
      overallAccuracy: totalSignals > 0 ? (totalWins / totalSignals) * 100 : 50,
      digitAccuracy
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SignalConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
let instance: SignalEngine | null = null;

/**
 * Get or create SignalEngine instance
 */
export function getSignalEngine(): SignalEngine {
  if (!instance) {
    instance = new SignalEngine();
  }
  return instance;
}

export default SignalEngine;
