// Default values for user configuration
export const DEFAULT_VALUES = {
  BLOCK_DURATION: 2100,      // 35 minutes (35 * 60 = 2100 seconds)
  TOTAL_CHUNKS: 0,           // 0 = no chunks, just one continuous block
  BREAK_DURATION: 120,       // 2 minutes (2 * 60 = 120 seconds)
  RESET_DURATION: 900,       // 15 minutes (15 * 60 = 900 seconds)
} as const;

// Testing values (shorter durations for faster testing)
export const TEST_VALUES = {
  BLOCK_DURATION: 20,        // 20 seconds
  TOTAL_CHUNKS: 2,           // 2 chunks
  BREAK_DURATION: 5,         // 5 seconds
  RESET_DURATION: 10,        // 10 seconds
} as const;

export type TimerState = 'IDLE' | 'CHUNK_ACTIVE' | 'CHUNK_BREAK' | 'NEUTRAL_RESET';

export const STATE_LABELS: Record<TimerState, string> = {
  IDLE: 'Configure Block',
  CHUNK_ACTIVE: 'Working',
  CHUNK_BREAK: 'Chunk Break',
  NEUTRAL_RESET: 'Cooldown Period',
};
