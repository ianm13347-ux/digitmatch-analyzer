import { TickData, DigitStats, Pattern } from '../types';
import {
  calculateDigitStats,
  calculateChiSquared,
  classifyDigit,
  calculateEntropy
} from '../utils/statistics';

/**
 * AnalysisEngine
 * Performs statistical analysis on digit data
 */

class AnalysisEngine {
  /**
   * Analyze digits and return statistics
   */
  analyzeDigits(digits: number[]): DigitStats[] {
    return calculateDigitStats(digits);
  }

  /**
   * Detect patterns in digit sequence
   */
  detectPatterns(digits: number[], windowSize: number = 50): Pattern[] {
    const patterns: Pattern[] = [];

    if (digits.length < 3) {
      return patterns;
    }

    // Check for repeated digits
    const recentDigits = digits.slice(-Math.min(windowSize, digits.length));
    const digitCounts = this.countDigitOccurrences(recentDigits);

    for (const [digit, count] of Object.entries(digitCounts)) {
      if (count > windowSize / 5) {
        patterns.push({
          type: 'repeated',
          description: `Digit ${digit} appeared ${count} times in last ${recentDigits.length} ticks`,
          confidence: Math.min(100, (count / recentDigits.length) * 100 * 1.5),
          affectedDigits: [parseInt(digit)]
        });
      }
    }

    // Check for alternating pattern
    if (this.isAlternatingPattern(recentDigits)) {
      patterns.push({
        type: 'alternating',
        description: 'Alternating digit pattern detected',
        confidence: 75,
        affectedDigits: Array.from({ length: 10 }, (_, i) => i)
      });
    }

    // Check for streaks
    const streaks = this.findStreaks(recentDigits);
    for (const { digit, length } of streaks) {
      if (length >= 3) {
        patterns.push({
          type: 'streak',
          description: `Digit ${digit} appeared ${length} times consecutively`,
          confidence: Math.min(100, length * 20),
          affectedDigits: [digit]
        });
      }
    }

    // Check for distribution deviation
    const chiSquared = calculateChiSquared(recentDigits);
    if (chiSquared > 20) {
      patterns.push({
        type: 'deviation',
        description: 'Significant deviation from uniform distribution detected',
        confidence: Math.min(100, (chiSquared / 30) * 100),
        affectedDigits: Array.from({ length: 10 }, (_, i) => i)
      });
    }

    return patterns;
  }

  /**
   * Count occurrences of each digit
   */
  private countDigitOccurrences(digits: number[]): Record<number, number> {
    const counts: Record<number, number> = {};
    for (let i = 0; i < 10; i++) {
      counts[i] = 0;
    }
    digits.forEach(d => {
      if (d >= 0 && d <= 9) counts[d]++;
    });
    return counts;
  }

  /**
   * Check for alternating pattern
   */
  private isAlternatingPattern(digits: number[]): boolean {
    if (digits.length < 4) return false;

    let alternating = 0;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i - 1]) {
        alternating++;
      }
    }

    return alternating / digits.length > 0.7;
  }

  /**
   * Find streaks of same digit
   */
  private findStreaks(
    digits: number[]
  ): Array<{ digit: number; length: number }> {
    const streaks: Array<{ digit: number; length: number }> = [];
    if (digits.length === 0) return streaks;

    let current = digits[0];
    let length = 1;

    for (let i = 1; i < digits.length; i++) {
      if (digits[i] === current) {
        length++;
      } else {
        if (length > 1) {
          streaks.push({ digit: current, length });
        }
        current = digits[i];
        length = 1;
      }
    }

    if (length > 1) {
      streaks.push({ digit: current, length });
    }

    return streaks.sort((a, b) => b.length - a.length);
  }

  /**
   * Calculate overall distribution quality
   */
  getDistributionQuality(digits: number[]): {
    entropy: number;
    uniformity: number;
    quality: 'good' | 'moderate' | 'poor';
  } {
    const entropy = calculateEntropy(digits);
    const maxEntropy = Math.log2(10); // ~3.32 for 10 digits
    const uniformity = (entropy / maxEntropy) * 100;

    let quality: 'good' | 'moderate' | 'poor';
    if (uniformity > 80) {
      quality = 'good';
    } else if (uniformity > 60) {
      quality = 'moderate';
    } else {
      quality = 'poor';
    }

    return { entropy, uniformity, quality };
  }

  /**
   * Get hot and cold digits
   */
  getHotColdDigits(
    stats: DigitStats[],
    hotThreshold: number = 2,
    coldThreshold: number = 2
  ): {
    hot: DigitStats[];
    cold: DigitStats[];
    neutral: DigitStats[];
  } {
    const hot: DigitStats[] = [];
    const cold: DigitStats[] = [];
    const neutral: DigitStats[] = [];

    stats.forEach(stat => {
      const deviation = stat.frequency - 10; // Expected 10%
      if (deviation > hotThreshold) {
        hot.push(stat);
      } else if (deviation < -coldThreshold) {
        cold.push(stat);
      } else {
        neutral.push(stat);
      }
    });

    return { hot, cold, neutral };
  }

  /**
   * Generate analysis summary
   */
  generateSummary(digits: number[], windowSize: number): string {
    if (digits.length === 0) {
      return 'No data available for analysis.';
    }

    const stats = this.analyzeDigits(digits);
    const patterns = this.detectPatterns(digits, windowSize);
    const quality = this.getDistributionQuality(digits);
    const { hot, cold } = this.getHotColdDigits(stats);

    const lines: string[] = [];

    // Most frequent digit
    if (stats.length > 0) {
      lines.push(`Most frequent digit: ${stats[0].digit} (${stats[0].frequency.toFixed(1)}%)`);
    }

    // Hot/Cold digits
    if (hot.length > 0) {
      lines.push(`Hot digits: ${hot.map(s => s.digit).join(', ')}`);
    }
    if (cold.length > 0) {
      lines.push(`Cold digits: ${cold.map(s => s.digit).join(', ')}`);
    }

    // Distribution quality
    lines.push(`Distribution quality: ${quality.quality} (${quality.uniformity.toFixed(1)}%)`);

    // Patterns
    if (patterns.length > 0) {
      lines.push(`Patterns detected: ${patterns.length}`);
      patterns.slice(0, 2).forEach(p => {
        lines.push(`- ${p.description}`);
      });
    } else {
      lines.push('No strong patterns detected in current sample.');
    }

    return lines.join('\n');
  }
}

// Singleton instance
let instance: AnalysisEngine | null = null;

/**
 * Get or create AnalysisEngine instance
 */
export function getAnalysisEngine(): AnalysisEngine {
  if (!instance) {
    instance = new AnalysisEngine();
  }
  return instance;
}

export default AnalysisEngine;
