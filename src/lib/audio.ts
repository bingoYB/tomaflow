import { clamp } from "./time";
import type { SoundPreset } from "../types";

type SoundStep = {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gap?: number;
};

const SOUND_MAP: Record<SoundPreset, SoundStep[]> = {
  softBell: [
    { frequency: 784, duration: 0.12, type: "sine", gap: 0.03 },
    { frequency: 988, duration: 0.16, type: "sine", gap: 0.04 },
    { frequency: 1175, duration: 0.2, type: "sine", gap: 0.03 }
  ],
  digitalPing: [
    { frequency: 1320, duration: 0.07, type: "square", gap: 0.04 },
    { frequency: 980, duration: 0.09, type: "square", gap: 0.03 },
    { frequency: 1320, duration: 0.12, type: "square", gap: 0.02 }
  ],
  woodBlock: [
    { frequency: 220, duration: 0.05, type: "triangle", gap: 0.05 },
    { frequency: 240, duration: 0.05, type: "triangle", gap: 0.05 },
    { frequency: 260, duration: 0.05, type: "triangle", gap: 0.02 },
    { frequency: 220, duration: 0.11, type: "triangle", gap: 0.02 }
  ]
};

export const playSound = async (preset: SoundPreset, volume: number): Promise<void> => {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) {
    return;
  }

  const context = new AudioContextConstructor();
  await context.resume();

  const gain = context.createGain();
  gain.gain.value = clamp(volume, 0, 1) * 0.22;
  gain.connect(context.destination);

  const sequence = SOUND_MAP[preset];
  let current = context.currentTime;

  sequence.forEach((step) => {
    const oscillator = context.createOscillator();
    oscillator.type = step.type;
    oscillator.frequency.value = step.frequency;
    oscillator.connect(gain);
    oscillator.start(current);
    oscillator.stop(current + step.duration);
    current += step.duration + (step.gap ?? 0.02);
  });

  window.setTimeout(() => {
    void context.close();
  }, Math.ceil((current - context.currentTime + 0.25) * 1000));
};
