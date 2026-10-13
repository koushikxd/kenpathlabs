import { useSensoryUI } from "@/components/sensory-ui/config/provider";
import type { SoundRole } from "@/components/sensory-ui/config/sound-roles";

// Each moment pairs a sound with a vibration. `wrong` also covers errors, like the glitch does.
const MOMENTS = {
  correct: { sound: "notification.success", vibrate: 15 },
  wrong: { sound: "notification.error", vibrate: [40, 60, 40] },
  complete: { sound: "hero.complete", vibrate: [20, 80, 20, 80, 60] },
} satisfies Record<string, { sound: SoundRole; vibrate: VibratePattern }>;

export type Moment = keyof typeof MOMENTS;

export function useFeedback() {
  const { playSound } = useSensoryUI();
  return (moment: Moment) => {
    const { sound, vibrate } = MOMENTS[moment];
    void playSound(sound);
    // Typed as always present, but Safari has no vibrate at all.
    navigator.vibrate?.(vibrate);
  };
}
