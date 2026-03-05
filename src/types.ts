export type TimerMode = "work" | "shortBreak" | "longBreak";
export type ThemeMode = "light" | "dark";
export type SoundPreset = "softBell" | "digitalPing" | "woodBlock";
export type LanguageCode = "zh" | "en" | "hi" | "es" | "ar" | "fr" | "bn" | "pt" | "ru" | "ur";

export interface ShortcutSettings {
  startPause: string;
  switchTask: string;
  stopTask: string;
}

export interface Task {
  id: string;
  name: string;
  estimatedMinutes: number;
  createdAt: string;
  completed: boolean;
  actualWorkSeconds: number;
  completedPomodoros: number;
}

export interface DayStat {
  date: string;
  workSeconds: number;
  breakSeconds: number;
  pomodoros: number;
  taskSeconds: Record<string, number>;
}

export interface TimerCompletion {
  at: number;
  mode: TimerMode;
}

export interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  currentTaskId: string | null;
  completedWorkSessions: number;
  lastCompletion: TimerCompletion | null;
}

export interface Settings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  notificationSound: SoundPreset;
  notificationVolume: number;
  enableSystemNotification: boolean;
  language: LanguageCode;
  theme: ThemeMode;
  shortcuts: ShortcutSettings;
}

export interface AppState {
  tasks: Task[];
  statsByDate: Record<string, DayStat>;
  timer: TimerState;
  settings: Settings;
}
