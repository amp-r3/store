export interface HapticStep {
  duration: number;
  delay?: number;
  intensity?: number;
}

export interface HapticOptions {
  intensity?: number;
}

export interface HapticPreset {
  pattern: HapticStep[];
  options?: HapticOptions;
}

export type HapticPresetName =
  | "success"
  | "warning"
  | "error"
  | "light"
  | "medium"
  | "heavy"
  | "soft"
  | "rigid"
  | "selection"
  | "nudge"
  | "buzz";

export const HAPTIC_PRESETS: Record<HapticPresetName, HapticPreset> = {
  success: {
    pattern: [
      { duration: 30 },
      { delay: 60, duration: 40, intensity: 1 },
    ],
  },
  warning: {
    pattern: [
      { duration: 30 },
      { delay: 60, duration: 40, intensity: 1 },
    ],
  },
  error: {
    pattern: [
      { duration: 40 },
      { delay: 40, duration: 40 },
      { delay: 40, duration: 40 },
    ],
    options: { intensity: 0.9 },
  },
  light: {
    pattern: [{ duration: 15 }],
    options: { intensity: 0.4 },
  },
  medium: {
    pattern: [{ duration: 25 }],
    options: { intensity: 0.7 },
  },
  heavy: {
    pattern: [{ duration: 25 }],
    options: { intensity: 0.7 },
  },
  soft: {
    pattern: [{ duration: 40 }],
  },
  rigid: {
    pattern: [{ duration: 10 }],
    options: { intensity: 1 },
  },
  selection: {
    pattern: [{ duration: 8 }],
    options: { intensity: 0.3 },
  },
  nudge: {
    pattern: [
      { duration: 80, intensity: 0.8 },
      { delay: 80, duration: 50, intensity: 0.3 },
    ],
  },
  buzz: {
    pattern: [{ duration: 1000 }],
    options: { intensity: 1 },
  },
};