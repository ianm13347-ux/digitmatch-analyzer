import { TickData } from '../types';

/**
 * Demo data generator for testing and development
 */

const DEMO_QUOTES = [
  1234.567, 1234.523, 1234.589, 1234.501, 1234.546,
  1234.512, 1234.578, 1234.534, 1234.561, 1234.545,
  1234.523, 1234.567, 1234.589, 1234.512, 1234.578,
  1234.534, 1234.561, 1234.545, 1234.523, 1234.567,
  1234.589, 1234.512, 1234.578, 1234.534, 1234.561,
];

let demoTickIndex = 0;

/**
 * Generate a simulated tick
 */
export function generateDemoTick(symbol: string = 'R_50'): TickData {
  const quote = DEMO_QUOTES[demoTickIndex % DEMO_QUOTES.length];
  const lastDigit = Math.floor((quote * 10) % 10);
  
  demoTickIndex++;
  
  const now = new Date();
  const epoch = Math.floor(now.getTime() / 1000);
  
  return {
    id: `demo-${epoch}-${demoTickIndex}`,
    symbol,
    quote: quote.toFixed(3),
    timestamp: now.toISOString(),
    epoch,
    lastDigit
  };
}

/**
 * Generate multiple demo ticks
 */
export function generateDemoTicks(count: number, symbol: string = 'R_50'): TickData[] {
  const ticks: TickData[] = [];
  for (let i = 0; i < count; i++) {
    ticks.push(generateDemoTick(symbol));
  }
  return ticks;
}

/**
 * Reset demo data generator
 */
export function resetDemoData(): void {
  demoTickIndex = 0;
}

/**
 * Generate realistic historical digit sequence
 * Simulates slightly biased distribution (not perfectly random)
 */
export function generateRealisticDigitSequence(length: number, bias?: Record<number, number>): number[] {
  const digits: number[] = [];
  const baseProbabilities: Record<number, number> = {
    0: 10, 1: 10, 2: 10, 3: 10, 4: 10,
    5: 10, 6: 10, 7: 10, 8: 10, 9: 10
  };
  
  // Apply bias if provided
  if (bias) {
    Object.keys(bias).forEach(key => {
      const digit = parseInt(key);
      baseProbabilities[digit] = Math.max(0, baseProbabilities[digit] + bias[digit]);
    });
  }
  
  // Normalize probabilities
  const total = Object.values(baseProbabilities).reduce((a, b) => a + b, 0);
  const probabilities = Object.entries(baseProbabilities).map(([_, p]) => p / total);
  
  // Generate digits according to probabilities
  for (let i = 0; i < length; i++) {
    let rand = Math.random();
    for (let digit = 0; digit < 10; digit++) {
      rand -= probabilities[digit];
      if (rand <= 0) {
        digits.push(digit);
        break;
      }
    }
  }
  
  return digits;
}

/**
 * Create demo ticks with specific digit sequence
 */
export function createDemoTicksWithDigits(digits: number[], symbol: string = 'R_50'): TickData[] {
  const ticks: TickData[] = [];
  const startEpoch = Math.floor(Date.now() / 1000) - digits.length;
  
  digits.forEach((digit, index) => {
    const epoch = startEpoch + index;
    const quote = (1000 + Math.random() * 500 + digit * 0.1).toFixed(3);
    
    ticks.push({
      id: `demo-tick-${index}`,
      symbol,
      quote,
      timestamp: new Date(epoch * 1000).toISOString(),
      epoch,
      lastDigit: digit
    });
  });
  
  return ticks;
}

/**
 * Available demo markets
 */
export const DEMO_MARKETS = [
  { name: 'R_50', displayName: 'Volatility Index 50', category: 'volatility' as const },
  { name: 'R_75', displayName: 'Volatility Index 75', category: 'volatility' as const },
  { name: 'R_100', displayName: 'Volatility Index 100', category: 'volatility' as const },
  { name: 'BOOM_500', displayName: 'Boom 500', category: 'crash_boom' as const },
  { name: 'CRASH_500', displayName: 'Crash 500', category: 'crash_boom' as const },
];
