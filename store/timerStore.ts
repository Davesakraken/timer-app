import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { TimerState, DEFAULT_VALUES } from '@/constants/timerConstants';

interface TimerStore {
  // State
  currentState: TimerState;
  secondsRemaining: number;

  // Block configuration (user-defined)
  blockDuration: number;      // Total block duration in seconds
  totalChunks: number;        // 0 = no chunks, 1+ = chunks enabled
  breakDuration: number;      // Seconds between chunks
  resetDuration: number;      // Cooldown duration

  // Chunk tracking
  currentChunk: number;       // 1-indexed (chunk 1, 2, 3...)
  chunkDuration: number;      // Calculated: blockDuration / totalChunks

  // Actions
  setBlockConfig: (duration: number, chunks: number, breakDur: number) => void;
  startBlock: () => void;
  emergencyStop: () => void;
  tick: () => void;

  // Private transitions
  transitionToChunkBreak: () => void;
  transitionToNextChunk: () => void;
  transitionToReset: () => void;
  transitionToIdle: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  currentState: 'IDLE',
  secondsRemaining: 0,
  blockDuration: DEFAULT_VALUES.BLOCK_DURATION,
  totalChunks: DEFAULT_VALUES.TOTAL_CHUNKS,
  breakDuration: DEFAULT_VALUES.BREAK_DURATION,
  resetDuration: DEFAULT_VALUES.RESET_DURATION,
  currentChunk: 0,
  chunkDuration: 0,

  // Set block configuration (called from UI before starting)
  setBlockConfig: (duration: number, chunks: number, breakDur: number) => {
    set({
      blockDuration: duration,
      totalChunks: chunks,
      breakDuration: breakDur,
    });
  },

  // Start block (transition from IDLE to CHUNK_ACTIVE)
  startBlock: () => {
    const { currentState, blockDuration, totalChunks } = get();

    // Guard: Only start from IDLE
    if (currentState !== 'IDLE') return;

    // Calculate chunk duration
    const chunkDuration = totalChunks > 0
      ? Math.floor(blockDuration / totalChunks)
      : blockDuration;

    set({
      currentState: 'CHUNK_ACTIVE',
      currentChunk: 1,
      chunkDuration,
      secondsRemaining: chunkDuration,
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  // Emergency stop (only from CHUNK_ACTIVE, goes to NEUTRAL_RESET)
  emergencyStop: () => {
    const { currentState } = get();

    // Guard: Only from CHUNK_ACTIVE
    if (currentState !== 'CHUNK_ACTIVE') return;

    get().transitionToReset(); // Goes to reset, NOT idle
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  // Timer tick (called every second by useEffect in UI)
  tick: () => {
    const { secondsRemaining, currentState, currentChunk, totalChunks } = get();
    const newSeconds = secondsRemaining - 1;

    if (newSeconds <= 0) {
      // Handle state transitions based on current state
      if (currentState === 'CHUNK_ACTIVE') {
        // Check if this is the last chunk
        const isLastChunk = totalChunks === 0 || currentChunk >= totalChunks;

        if (isLastChunk) {
          get().transitionToReset(); // Block complete → cooldown
        } else {
          get().transitionToChunkBreak(); // More chunks → break
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (currentState === 'CHUNK_BREAK') {
        get().transitionToNextChunk(); // Break complete → next chunk
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (currentState === 'NEUTRAL_RESET') {
        get().transitionToIdle(); // Cooldown complete → idle
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      set({ secondsRemaining: newSeconds });
    }
  },

  // Private transition: Move to chunk break
  transitionToChunkBreak: () => {
    set({
      currentState: 'CHUNK_BREAK',
      secondsRemaining: get().breakDuration,
    });
  },

  // Private transition: Move to next chunk
  transitionToNextChunk: () => {
    const { currentChunk, chunkDuration } = get();
    set({
      currentState: 'CHUNK_ACTIVE',
      currentChunk: currentChunk + 1,
      secondsRemaining: chunkDuration,
    });
  },

  // Private transition: Move to neutral reset (cooldown)
  transitionToReset: () => {
    set({
      currentState: 'NEUTRAL_RESET',
      secondsRemaining: get().resetDuration,
      currentChunk: 0, // Reset chunk tracking
    });
  },

  // Private transition: Move back to idle
  transitionToIdle: () => {
    set({
      currentState: 'IDLE',
      secondsRemaining: 0,
      currentChunk: 0,
    });
  },
}));
