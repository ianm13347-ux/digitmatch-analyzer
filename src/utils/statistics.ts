import { DigitStats } from '../types';

/**
 * Statistical utility functions for digit analysis
 */

/**
 * Calculate frequency of digits in an array
 * 
 * @param digits - Array of digits (0-9)
 * @returns Frequency distribution
 */
export function calculateDigitFrequencies(digits: number[]): Record<number, number> {
  const frequencies: Record<number, number> = {};
  
  // Initialize all digits
  for (let i = 0; i < 10; i++) {
    frequencies[i] = 0;
  }
  
  // Count occurrences
  digits.forEach(digit => {
    if (digit >= 0 && digit <= 9) {
      frequencies[digit]++;
    }
  });
  
  return frequencies;
}

/**
 * Calculate comprehensive digit statistics
 * 
 * @param digits - Array of digits (0-9)
 * @returns Array of DigitStats sorted by frequency
 */
export function calculateDigitStats(digits: number[]): DigitStats[] {
  if (digits.length === 0) {
    return Array.from({ length: 10 }, (_, i) => createEmptyDigitStat(i));
  }
  
  const frequencies = calculateDigitFrequencies(digits);
  const stats: DigitStats[] = [];
  
  for (let digit = 0; digit < 10; digit++) {
    const count = frequencies[digit];
    const frequency = (count / digits.length) * 100;
    
    // Find last occurrence
    let lastSeenIndex = -1;
    for (let i = digits.length - 1; i >= 0; i--) {
      if (digits[i] === digit) {
        lastSeenIndex = i;
        break;
      }
    }
    
    // Calculate gap (distance since last occurrence)
    const gap = lastSeenIndex === -1 ? digits.length : digits.length - 1 - lastSeenIndex;
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
      if (digits[i] === digit) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let streak = 0;
    for (let i = 0; i < digits.length; i++) {
      if (digits[i] === digit) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    }
    
    stats.push({
      digit,
      count,
      frequency,
      lastSeenIndex,
      gap,
      currentStreak,
      longestStreak,
      rank: 0 // Will be calculated after sorting
    });
  }
  
  // Sort by frequency descending and assign ranks
  stats.sort((a, b) => b.frequency - a.frequency);
  stats.forEach((stat, index) => {
    stat.rank = index;
  });
  
  return stats;
}

/**
 * Create an empty digit stat
 */
function createEmptyDigitStat(digit: number): DigitStats {
  return {
    digit,
    count: 0,
    frequency: 10,
    lastSeenIndex: -1,
    gap: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: digit
  };
}

/**
 * Calculate mean and standard deviation
 * 
 * @param values - Array of numbers
 * @returns Object with mean and standard deviation
 */
export function calculateStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0 };
  }
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return { mean, stdDev };
}

/**
 * Classify a digit as hot, cold, or neutral based on frequency
 * Expected frequency is 10% for fair distribution
 * 
 * @param frequency - The digit's frequency percentage
 * @param expectedFrequency - Expected frequency (default 10%)
 * @param hotThreshold - Threshold above expected (default 2%)
 * @param coldThreshold - Threshold below expected (default 2%)
 * @returns Classification
 */
export function classifyDigit(
  frequency: number,
  expectedFrequency: number = 10,
  hotThreshold: number = 2,
  coldThreshold: number = 2
): 'hot' | 'cold' | 'neutral' {
  const deviation = frequency - expectedFrequency;
  
  if (deviation > hotThreshold) {
    return 'hot';
  }
  if (deviation < -coldThreshold) {
    return 'cold';
  }
  return 'neutral';
}

/**
 * Calculate chi-squared test for goodness of fit
 * Tests if observed frequencies match expected (uniform 10% each)
 * 
 * @param digits - Array of observed digits
 * @returns Chi-squared statistic
 */
export function calculateChiSquared(digits: number[]): number {
  const frequencies = calculateDigitFrequencies(digits);
  const expected = digits.length / 10; // Expected count per digit
  
  let chiSquared = 0;
  for (let i = 0; i < 10; i++) {
    const observed = frequencies[i];
    const diff = observed - expected;
    chiSquared += (diff * diff) / expected;
  }
  
  return chiSquared;
}

/**
 * Calculate correlation between two digit sequences
 * 
 * @param seq1 - First sequence of digits
 * @param seq2 - Second sequence of digits
 * @returns Correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(seq1: number[], seq2: number[]): number {
  const minLength = Math.min(seq1.length, seq2.length);
  
  if (minLength === 0) return 0;
  
  const sub1 = seq1.slice(-minLength);
  const sub2 = seq2.slice(-minLength);
  
  const stats1 = calculateStats(sub1);
  const stats2 = calculateStats(sub2);
  
  if (stats1.stdDev === 0 || stats2.stdDev === 0) return 0;
  
  let covariance = 0;
  for (let i = 0; i < minLength; i++) {
    covariance += (sub1[i] - stats1.mean) * (sub2[i] - stats2.mean);
  }
  covariance /= minLength;
  
  const correlation = covariance / (stats1.stdDev * stats2.stdDev);
  return Math.max(-1, Math.min(1, correlation));
}

/**
 * Calculate entropy of a digit sequence
 * Higher entropy means more random distribution
 * 
 * @param digits - Array of digits
 * @returns Entropy value (0 to ~3.32 for 10 digits)
 */
export function calculateEntropy(digits: number[]): number {
  if (digits.length === 0) return 0;
  
  const frequencies = calculateDigitFrequencies(digits);
  let entropy = 0;
  
  for (let i = 0; i < 10; i++) {
    const probability = frequencies[i] / digits.length;
    if (probability > 0) {
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return entropy;
}
