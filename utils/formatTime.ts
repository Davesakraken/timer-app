/**
 * Formats seconds into MM:SS string format
 * @param seconds - Total seconds to format
 * @returns Formatted string "MM:SS"
 * @example formatTime(125) => "02:05"
 * @example formatTime(3661) => "61:01" (handles > 60 minutes)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Pad with leading zeros
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');

  return `${minsStr}:${secsStr}`;
}
