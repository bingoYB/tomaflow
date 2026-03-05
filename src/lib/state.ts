import type { AppState, DayStat, LanguageCode, Settings, ShortcutSettings, Task, TimerMode, TimerState } from "../types";
import { clamp, todayKey } from "./time";

export const LANGUAGE_LIST: Array<{ code: LanguageCode; label: string }> = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "bn", label: "বাংলা" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ur", label: "اردو" }
];

export const SOUND_OPTIONS = [
  { value: "softBell", labelKey: "softBell" },
  { value: "digitalPing", labelKey: "digitalPing" },
  { value: "woodBlock", labelKey: "woodBlock" }
] as const;

export const MODE_OPTIONS: TimerMode[] = ["work", "shortBreak", "longBreak"];

export const RTL_LANGUAGES = new Set<LanguageCode>(["ar", "ur"]);

export const defaultShortcuts: ShortcutSettings = {
  startPause: " ",
  switchTask: "t",
  stopTask: "r"
};

export const defaultSettings: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  notificationSound: "softBell",
  notificationVolume: 0.75,
  enableSystemNotification: false,
  language: "zh",
  theme: "dark",
  shortcuts: defaultShortcuts
};

export const modeSeconds = (mode: TimerMode, settings: Settings): number => {
  switch (mode) {
    case "work":
      return settings.workMinutes * 60;
    case "shortBreak":
      return settings.shortBreakMinutes * 60;
    case "longBreak":
      return settings.longBreakMinutes * 60;
    default:
      return settings.workMinutes * 60;
  }
};

export const defaultTimer = (settings: Settings): TimerState => ({
  mode: "work",
  secondsLeft: modeSeconds("work", settings),
  isRunning: false,
  currentTaskId: null,
  completedWorkSessions: 0,
  lastCompletion: null
});

export const defaultAppState = (): AppState => ({
  tasks: [],
  statsByDate: {},
  settings: defaultSettings,
  timer: defaultTimer(defaultSettings)
});

const dateKeyDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isoDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

type DemoDayTemplate = {
  daysAgo: number;
  workMinutes: number;
  breakMinutes: number;
  pomodoros: number;
  taskMinutes: Record<string, number>;
};

export const createDemoAppState = (): AppState => {
  const demoSettings: Settings = {
    ...defaultSettings,
    shortcuts: { ...defaultShortcuts }
  };

  const taskIds = {
    planning: "demo-task-planning",
    coding: "demo-task-coding",
    reading: "demo-task-reading",
    review: "demo-task-review"
  } as const;

  const demoDays: DemoDayTemplate[] = [
    {
      daysAgo: 6,
      workMinutes: 175,
      breakMinutes: 40,
      pomodoros: 7,
      taskMinutes: {
        [taskIds.planning]: 70,
        [taskIds.coding]: 70,
        [taskIds.reading]: 35
      }
    },
    {
      daysAgo: 5,
      workMinutes: 200,
      breakMinutes: 45,
      pomodoros: 8,
      taskMinutes: {
        [taskIds.planning]: 50,
        [taskIds.coding]: 100,
        [taskIds.review]: 50
      }
    },
    {
      daysAgo: 4,
      workMinutes: 150,
      breakMinutes: 35,
      pomodoros: 6,
      taskMinutes: {
        [taskIds.planning]: 50,
        [taskIds.coding]: 50,
        [taskIds.reading]: 50
      }
    },
    {
      daysAgo: 3,
      workMinutes: 225,
      breakMinutes: 50,
      pomodoros: 9,
      taskMinutes: {
        [taskIds.planning]: 50,
        [taskIds.coding]: 125,
        [taskIds.review]: 50
      }
    },
    {
      daysAgo: 2,
      workMinutes: 175,
      breakMinutes: 40,
      pomodoros: 7,
      taskMinutes: {
        [taskIds.review]: 75,
        [taskIds.coding]: 50,
        [taskIds.reading]: 50
      }
    },
    {
      daysAgo: 1,
      workMinutes: 200,
      breakMinutes: 45,
      pomodoros: 8,
      taskMinutes: {
        [taskIds.planning]: 50,
        [taskIds.coding]: 100,
        [taskIds.review]: 50
      }
    },
    {
      daysAgo: 0,
      workMinutes: 175,
      breakMinutes: 40,
      pomodoros: 7,
      taskMinutes: {
        [taskIds.planning]: 75,
        [taskIds.coding]: 75,
        [taskIds.reading]: 25
      }
    }
  ];

  const taskWorkTotals = new Map<string, number>();
  const statsByDate: Record<string, DayStat> = {};

  demoDays.forEach((item) => {
    const taskSeconds: Record<string, number> = {};

    Object.entries(item.taskMinutes).forEach(([taskId, minutes]) => {
      const seconds = Math.max(0, Math.round(minutes * 60));
      taskSeconds[taskId] = seconds;
      taskWorkTotals.set(taskId, (taskWorkTotals.get(taskId) ?? 0) + seconds);
    });

    const date = dateKeyDaysAgo(item.daysAgo);
    statsByDate[date] = {
      date,
      workSeconds: Math.round(item.workMinutes * 60),
      breakSeconds: Math.round(item.breakMinutes * 60),
      pomodoros: item.pomodoros,
      taskSeconds
    };
  });

  const demoTasks: Task[] = [
    {
      id: taskIds.coding,
      name: "迭代首页交互",
      estimatedMinutes: 180,
      createdAt: isoDaysAgo(9),
      completed: false,
      actualWorkSeconds: taskWorkTotals.get(taskIds.coding) ?? 0,
      completedPomodoros: Math.round((taskWorkTotals.get(taskIds.coding) ?? 0) / (25 * 60))
    },
    {
      id: taskIds.planning,
      name: "拆解版本需求",
      estimatedMinutes: 120,
      createdAt: isoDaysAgo(10),
      completed: false,
      actualWorkSeconds: taskWorkTotals.get(taskIds.planning) ?? 0,
      completedPomodoros: Math.round((taskWorkTotals.get(taskIds.planning) ?? 0) / (25 * 60))
    },
    {
      id: taskIds.review,
      name: "代码评审与修复",
      estimatedMinutes: 90,
      createdAt: isoDaysAgo(8),
      completed: false,
      actualWorkSeconds: taskWorkTotals.get(taskIds.review) ?? 0,
      completedPomodoros: Math.round((taskWorkTotals.get(taskIds.review) ?? 0) / (25 * 60))
    },
    {
      id: taskIds.reading,
      name: "阅读技术文档",
      estimatedMinutes: 60,
      createdAt: isoDaysAgo(7),
      completed: true,
      actualWorkSeconds: taskWorkTotals.get(taskIds.reading) ?? 0,
      completedPomodoros: Math.round((taskWorkTotals.get(taskIds.reading) ?? 0) / (25 * 60))
    }
  ];

  const timer = defaultTimer(demoSettings);
  timer.currentTaskId = taskIds.coding;
  timer.completedWorkSessions = 3;

  return {
    tasks: demoTasks,
    statsByDate,
    settings: demoSettings,
    timer
  };
};

const upsertDayStat = (stats: Record<string, DayStat>, date: string): DayStat => {
  const existing = stats[date];
  if (existing) {
    return {
      ...existing,
      taskSeconds: { ...existing.taskSeconds }
    };
  }

  return {
    date,
    workSeconds: 0,
    breakSeconds: 0,
    pomodoros: 0,
    taskSeconds: {}
  };
};

const incrementTaskSeconds = (tasks: Task[], taskId: string | null, delta: number): Task[] => {
  if (!taskId) {
    return tasks;
  }

  return tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      actualWorkSeconds: task.actualWorkSeconds + delta
    };
  });
};

const incrementTaskPomodoros = (tasks: Task[], taskId: string | null): Task[] => {
  if (!taskId) {
    return tasks;
  }

  return tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      completedPomodoros: task.completedPomodoros + 1
    };
  });
};

const nextModeAfterCompletion = (mode: TimerMode, completedWorkSessions: number, settings: Settings): TimerMode => {
  if (mode !== "work") {
    return "work";
  }

  return completedWorkSessions % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak";
};

export const tick = (state: AppState): AppState => {
  if (!state.timer.isRunning) {
    return state;
  }

  const date = todayKey();
  const nextDay = upsertDayStat(state.statsByDate, date);
  const nextStatsByDate = { ...state.statsByDate, [date]: nextDay };
  const isWork = state.timer.mode === "work";

  if (isWork) {
    nextDay.workSeconds += 1;
    if (state.timer.currentTaskId) {
      nextDay.taskSeconds[state.timer.currentTaskId] = (nextDay.taskSeconds[state.timer.currentTaskId] ?? 0) + 1;
    }
  } else {
    nextDay.breakSeconds += 1;
  }

  const nextTasks = isWork ? incrementTaskSeconds(state.tasks, state.timer.currentTaskId, 1) : state.tasks;
  const nextSecondsLeft = state.timer.secondsLeft - 1;

  if (nextSecondsLeft > 0) {
    return {
      ...state,
      statsByDate: nextStatsByDate,
      tasks: nextTasks,
      timer: {
        ...state.timer,
        secondsLeft: nextSecondsLeft
      }
    };
  }

  const completedWorkSessions = isWork ? state.timer.completedWorkSessions + 1 : state.timer.completedWorkSessions;
  const updatedTasks = isWork ? incrementTaskPomodoros(nextTasks, state.timer.currentTaskId) : nextTasks;

  if (isWork) {
    nextDay.pomodoros += 1;
  }

  const mode = nextModeAfterCompletion(state.timer.mode, completedWorkSessions, state.settings);

  return {
    ...state,
    statsByDate: nextStatsByDate,
    tasks: updatedTasks,
    timer: {
      ...state.timer,
      mode,
      secondsLeft: modeSeconds(mode, state.settings),
      isRunning: false,
      completedWorkSessions,
      lastCompletion: {
        at: Date.now(),
        mode: state.timer.mode
      }
    }
  };
};

export const sanitizeSettings = (settings: Settings): Settings => ({
  ...settings,
  workMinutes: clamp(Math.round(settings.workMinutes), 1, 180),
  shortBreakMinutes: clamp(Math.round(settings.shortBreakMinutes), 1, 60),
  longBreakMinutes: clamp(Math.round(settings.longBreakMinutes), 1, 120),
  longBreakInterval: clamp(Math.round(settings.longBreakInterval), 2, 8),
  notificationVolume: clamp(settings.notificationVolume, 0, 1),
  shortcuts: sanitizeShortcuts(settings.shortcuts)
});

const normalizeShortcutKey = (value: unknown, fallback: string): string => {
  if (value === " ") {
    return " ";
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const lowered = value.trim().toLowerCase();
  if (lowered === "space") {
    return " ";
  }

  if (lowered.length === 1) {
    return lowered;
  }

  return fallback;
};

const sanitizeShortcuts = (shortcuts: ShortcutSettings | undefined): ShortcutSettings => {
  const source = shortcuts ?? defaultShortcuts;
  return {
    startPause: normalizeShortcutKey(source.startPause, defaultShortcuts.startPause),
    switchTask: normalizeShortcutKey(source.switchTask, defaultShortcuts.switchTask),
    stopTask: normalizeShortcutKey(source.stopTask, defaultShortcuts.stopTask)
  };
};
