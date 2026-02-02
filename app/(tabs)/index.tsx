import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { STATE_LABELS, TimerState } from "@/constants/timerConstants";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTimerStore } from "@/store/timerStore";
import { formatTime } from "@/utils/formatTime";

export default function TimerScreen() {
  // Local state for configuration inputs (used only in IDLE state)
  const [blockMinutes, setBlockMinutes] = useState("35");
  const [chunks, setChunks] = useState("0");
  const [breakMinutes, setBreakMinutes] = useState("2");

  // Get color scheme for TextInput theming
  const colorScheme = useColorScheme();

  // Subscribe to Zustand store
  const {
    currentState,
    secondsRemaining,
    currentChunk,
    totalChunks,
    setBlockConfig,
    startBlock,
    emergencyStop,
    tick,
  } = useTimerStore();

  // Timer interval (runs in all active states)
  useEffect(() => {
    const activeStates: TimerState[] = ["CHUNK_ACTIVE", "CHUNK_BREAK", "NEUTRAL_RESET"];

    if (activeStates.includes(currentState)) {
      const interval = setInterval(() => tick(), 1000);
      return () => clearInterval(interval); // CRITICAL: cleanup to prevent memory leaks
    }
  }, [currentState, tick]);

  // Handle start with configuration
  const handleStart = () => {
    const duration = parseInt(blockMinutes) * 60;
    const chunkCount = parseInt(chunks);
    const breakDur = parseInt(breakMinutes) * 60;

    setBlockConfig(duration, chunkCount, breakDur);
    startBlock();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header area with fixed height */}
      <View style={styles.headerArea}>
        <ThemedText type="subtitle" style={styles.stateLabel}>
          {STATE_LABELS[currentState]}
        </ThemedText>

        {totalChunks > 0 && (currentState === "CHUNK_ACTIVE" || currentState === "CHUNK_BREAK") && (
          <ThemedText style={styles.chunkLabel}>
            Chunk {currentChunk} of {totalChunks}
          </ThemedText>
        )}
      </View>

      {/* Centered area for timer and buttons */}
      <View style={styles.centeredArea}>
        {/* Large timer display (hide in IDLE state) */}
        {currentState !== "IDLE" && (
          <ThemedText style={styles.timerDisplay}>{formatTime(secondsRemaining)}</ThemedText>
        )}

        {/* IDLE: Configuration inputs and start button */}
        {currentState === "IDLE" && (
          <View style={styles.configContainer}>
            <View style={styles.inputRow}>
              <ThemedText style={styles.inputLabel}>Block Duration (min):</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                    borderColor: Colors[colorScheme ?? "light"].icon,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                ]}
                value={blockMinutes}
                onChangeText={setBlockMinutes}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputRow}>
              <ThemedText style={styles.inputLabel}>Chunks (0 = none):</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                    borderColor: Colors[colorScheme ?? "light"].icon,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                ]}
                value={chunks}
                onChangeText={setChunks}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputRow}>
              <ThemedText style={styles.inputLabel}>Break Duration (min):</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme ?? "light"].text,
                    borderColor: Colors[colorScheme ?? "light"].icon,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                ]}
                value={breakMinutes}
                onChangeText={setBreakMinutes}
                keyboardType="number-pad"
              />
            </View>

            <Pressable style={styles.startButton} onPress={handleStart}>
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Start Block
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* CHUNK_ACTIVE: Emergency stop button */}
        {currentState === "CHUNK_ACTIVE" && (
          <Pressable style={styles.stopButton} onPress={emergencyStop}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Emergency Stop
            </ThemedText>
          </Pressable>
        )}

        {/* CHUNK_BREAK: Locked (no buttons) */}
        {currentState === "CHUNK_BREAK" && (
          <ThemedText style={styles.lockedText}>Break in progress...</ThemedText>
        )}

        {/* NEUTRAL_RESET: Locked (no buttons) */}
        {currentState === "NEUTRAL_RESET" && (
          <ThemedText style={styles.lockedText}>Cannot start until cooldown completes</ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerArea: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  stateLabel: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  chunkLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 0,
    textAlign: "center",
  },
  centeredArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: "bold",
    lineHeight: 50,
    marginBottom: 40,
    letterSpacing: 2,
    textAlign: "center",
    paddingVertical: 20,
  },
  configContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  inputLabel: {
    flex: 1,
  },
  input: {
    width: 80,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  lockedText: {
    marginTop: 20,
    opacity: 0.6,
    textAlign: "center",
  },
});
