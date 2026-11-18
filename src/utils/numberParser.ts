/**
 * Parse custom numbers string into array of strings.
 * Supports:
 * - Comma-separated: "1, 3, 7, 10" or "1，3，7，10" or "1、3、7、10"
 * - Ranges: "1-5", "1~5", "1～5"
 * - Spaces / newlines: "1 3 7 10"
 * - Optional zero-padding
 */
export function parseCustomNumbers(
  input: string,
  padDigits: number = 0,
  prefix: string = ''
): string[] {
  if (!input || !input.trim()) return [];

  // Split by comma (half/full-width), ideographic comma (、), spaces, semicolons, newlines
  const tokens = input
    .split(/[,，、\s;；\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const result: string[] = [];

  for (const token of tokens) {
    // Check for range format: e.g. "1-5", "1~5", "1～5"
    const rangeMatch = token.match(/^(\d+)[-~～](\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      // Safety limit on single range token
      if (max - min < 2000) {
        for (let i = min; i <= max; i++) {
          const numStr = padDigits > 0 ? i.toString().padStart(padDigits, '0') : i.toString();
          result.push(prefix ? `${prefix}${numStr}` : numStr);
        }
      }
    } else {
      // Single item
      if (/^\d+$/.test(token)) {
        const num = parseInt(token, 10);
        const numStr = padDigits > 0 ? num.toString().padStart(padDigits, '0') : token;
        result.push(prefix ? `${prefix}${numStr}` : numStr);
      } else {
        result.push(token);
      }
    }
  }

  // Remove duplicates while preserving original order
  return Array.from(new Set(result));
}

/**
 * Generate range numbers from start to end
 */
export function generateRangeNumbers(
  start: number,
  end: number,
  padDigits: number = 0,
  prefix: string = ''
): string[] {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const result: string[] = [];
  for (let i = min; i <= max; i++) {
    const numStr = padDigits > 0 ? i.toString().padStart(padDigits, '0') : i.toString();
    result.push(prefix ? `${prefix}${numStr}` : numStr);
  }
  return result;
}
