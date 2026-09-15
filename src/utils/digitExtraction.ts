/**
 * Digit extraction utilities with robust decimal precision handling
 */

/**
 * Extract the last digit from a quote string or number
 * Handles various decimal precisions robustly
 * 
 * @param quote - The quote as string or number
 * @returns The last digit (0-9)
 */
export function extractLastDigit(quote: string | number): number {
  // Convert to string if number
  let quoteStr = typeof quote === 'number' ? quote.toString() : quote;
  
  // Remove any whitespace
  quoteStr = quoteStr.trim();
  
  // Handle negative numbers
  if (quoteStr.startsWith('-')) {
    quoteStr = quoteStr.substring(1);
  }
  
  // Remove the decimal point and everything before it
  const decimalIndex = quoteStr.indexOf('.');
  if (decimalIndex !== -1) {
    quoteStr = quoteStr.substring(decimalIndex + 1);
  } else {
    // If no decimal point, take the last digit of the number
    quoteStr = quoteStr.substring(quoteStr.length - 1);
  }
  
  // Get the first character of what remains (first decimal place)
  // Or if no decimals, get the last digit of the integer
  const lastDigitStr = quoteStr.charAt(0);
  const digit = parseInt(lastDigitStr, 10);
  
  // Validate it's a proper digit
  if (isNaN(digit) || digit < 0 || digit > 9) {
    throw new Error(`Invalid digit extracted from quote: ${quote}`);
  }
  
  return digit;
}

/**
 * Extract last digit using decimal place precision
 * Takes the digit at a specific decimal place
 * 
 * @param quote - The quote as string or number
 * @param decimalPlace - Which decimal place to extract (1 = first decimal, 2 = second, etc.)
 * @returns The digit at that position
 */
export function extractDigitAtPosition(quote: string | number, decimalPlace: number = 1): number {
  let quoteStr = typeof quote === 'number' ? quote.toString() : quote;
  quoteStr = quoteStr.trim();
  
  // Handle negative numbers
  if (quoteStr.startsWith('-')) {
    quoteStr = quoteStr.substring(1);
  }
  
  const decimalIndex = quoteStr.indexOf('.');
  if (decimalIndex === -1) {
    throw new Error('No decimal point found in quote');
  }
  
  const decimals = quoteStr.substring(decimalIndex + 1);
  const position = decimalPlace - 1; // 0-based index
  
  if (position >= decimals.length) {
    throw new Error(`Decimal place ${decimalPlace} not found in quote: ${quote}`);
  }
  
  const digit = parseInt(decimals.charAt(position), 10);
  
  if (isNaN(digit) || digit < 0 || digit > 9) {
    throw new Error(`Invalid digit extracted from quote: ${quote}`);
  }
  
  return digit;
}

/**
 * Normalize a quote to a standard precision
 * Useful for consistent digit extraction
 * 
 * @param quote - The quote to normalize
 * @param decimalPlaces - Number of decimal places to keep
 * @returns Normalized quote string
 */
export function normalizeQuote(quote: string | number, decimalPlaces: number = 3): string {
  const num = typeof quote === 'string' ? parseFloat(quote) : quote;
  return num.toFixed(decimalPlaces);
}

/**
 * Validate that a digit is valid
 * 
 * @param digit - The digit to validate
 * @returns True if valid (0-9)
 */
export function isValidDigit(digit: number): boolean {
  return typeof digit === 'number' && digit >= 0 && digit <= 9 && Number.isInteger(digit);
}

/**
 * Test digit extraction with various quote formats
 */
export function testDigitExtraction(): void {
  const testCases = [
    { quote: '1234.567', expected: 5 },
    { quote: '1234.5', expected: 5 },
    { quote: 1234.567, expected: 5 },
    { quote: '1234.123', expected: 1 },
    { quote: '-1234.567', expected: 5 },
    { quote: '999.999', expected: 9 },
    { quote: '100.0', expected: 0 },
  ];
  
  testCases.forEach(({ quote, expected }) => {
    const result = extractLastDigit(quote);
    console.log(`Quote: ${quote} => Digit: ${result} (Expected: ${expected}) ${result === expected ? '✓' : '✗'}`);
  });
}
