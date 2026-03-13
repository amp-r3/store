import { HAPTIC_PRESETS, HapticOptions, HapticPresetName, HapticStep } from "@/utils/hapticPresets";
import { useWebHaptics } from "web-haptics/react";

type PresetTriggers = Record<HapticPresetName, () => void>;

interface UseHapticsReturn extends PresetTriggers {
    trigger: (pattern: HapticStep[], options?: HapticOptions) => void;
}

export function useHaptics(): UseHapticsReturn {
    const { trigger } = useWebHaptics();

    const presets = (Object.keys(HAPTIC_PRESETS) as HapticPresetName[]).reduce(
        (acc, name) => {
            acc[name] = () => trigger(HAPTIC_PRESETS[name].pattern, HAPTIC_PRESETS[name].options);
            return acc;
        },
        {} as PresetTriggers
    );

    return { trigger, ...presets };
}