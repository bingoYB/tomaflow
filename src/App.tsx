import { CircleHelp, Download, Github, Globe2, MoonStar, Settings2, SunMedium, X } from "lucide-react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import { SettingsPanel } from "./components/SettingsPanel";
import { TaskPanel } from "./components/TaskPanel";
import { TimerPanel } from "./components/TimerPanel";
import { createTranslator } from "./i18n";
import { useLocalStorageState } from "./hooks/useLocalStorage";
import { playSound } from "./lib/audio";
import {
  LANGUAGE_LIST,
  RTL_LANGUAGES,
  createDemoAppState,
  defaultAppState,
  defaultShortcuts,
  defaultTimer,
  modeSeconds,
  sanitizeSettings,
  tick
} from "./lib/state";
import { ensureNotificationPermission, showSystemNotification } from "./lib/notifications";
import type { AppState, LanguageCode, Settings, TimerMode } from "./types";

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PermissionResult = "ok" | "unsupported" | "denied";

const stateStorageKey = "focus-flow-state-v1";
const githubRepoUrl = "https://github.com/bingoYB/toma_flow";
const StatsPanel = lazy(() =>
  import("./components/StatsPanel").then((module) => ({
    default: module.StatsPanel
  }))
);

const safeRandomId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatDurationWithUnits = (seconds: number, hoursLabel: string, minutesLabel: string): string => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${totalMinutes} ${minutesLabel}`;
  }

  if (minutes === 0) {
    return `${hours} ${hoursLabel}`;
  }

  return `${hours} ${hoursLabel} ${minutes} ${minutesLabel}`;
};

const getSkippedMode = (mode: TimerMode): TimerMode => {
  if (mode === "work") {
    return "shortBreak";
  }
  return "work";
};

const isDemoHash = (hash: string): boolean => {
  const normalized = hash.replace(/^#/, "").trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized.split("&").includes("demo");
};

const keyFromEvent = (event: KeyboardEvent): string | null => {
  if (event.code === "Space" || event.key === " ") {
    return " ";
  }

  const key = event.key.toLowerCase();
  if (key.length === 1) {
    return key;
  }

  return null;
};

const isInputLikeTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") {
    return true;
  }

  if (target.isContentEditable || target.closest("[contenteditable='true']")) {
    return true;
  }

  return target.getAttribute("role") === "textbox";
};

const App = (): JSX.Element => {
  const [persistedState, setPersistedState] = useLocalStorageState<AppState>(stateStorageKey, defaultAppState());
  const [demoState, setDemoState] = useState<AppState>(() => createDemoAppState());
  const [isDemoMode, setIsDemoMode] = useState(() => (typeof window !== "undefined" ? isDemoHash(window.location.hash) : false));
  const state = isDemoMode ? demoState : persistedState;
  const setState = useCallback(
    (updater: SetStateAction<AppState>) => {
      if (isDemoMode) {
        setDemoState(updater);
        return;
      }

      setPersistedState(updater);
    },
    [isDemoMode, setPersistedState]
  );
  const [installPrompt, setInstallPrompt] = useState<DeferredPromptEvent | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const notifiedCompletionRef = useRef<number | null>(null);
  const t = useMemo(() => createTranslator(state.settings.language), [state.settings.language]);
  const lastCompletionAt = state.timer.lastCompletion?.at;
  const shortcuts = state.settings.shortcuts ?? defaultShortcuts;
  const settingsForView: Settings = { ...state.settings, shortcuts };
  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  const currentTask = state.tasks.find((task) => task.id === state.timer.currentTaskId);
  const currentTaskName = currentTask?.name ?? t("noTask");
  const totalSeconds = modeSeconds(state.timer.mode, settingsForView);

  const formatShortcutKey = useCallback(
    (value: string): string => {
      if (value === " ") {
        return t("spaceKey");
      }
      return value.toUpperCase();
    },
    [t]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncDemoMode = () => {
      const nextDemoMode = isDemoHash(window.location.hash);
      setIsDemoMode(nextDemoMode);
      if (nextDemoMode) {
        setDemoState(createDemoAppState());
      }
    };

    syncDemoMode();
    window.addEventListener("hashchange", syncDemoMode);
    return () => {
      window.removeEventListener("hashchange", syncDemoMode);
    };
  }, []);

  useEffect(() => {
    setState((prev) => {
      const nextSettings = sanitizeSettings(prev.settings as Settings);
      const timer = prev.timer ?? defaultTimer(nextSettings);
      return {
        ...prev,
        settings: nextSettings,
        timer: {
          ...timer,
          secondsLeft: timer.isRunning ? timer.secondsLeft : modeSeconds(timer.mode, nextSettings)
        }
      };
    });
  }, [setState]);

  useEffect(() => {
    if (!state.timer.isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setState((prev) => tick(prev));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [setState, state.timer.isRunning]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.settings.theme === "dark");
  }, [state.settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = state.settings.language;
    root.dir = RTL_LANGUAGES.has(state.settings.language) ? "rtl" : "ltr";
  }, [state.settings.language]);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  useEffect(() => {
    if (!state.timer.lastCompletion || !lastCompletionAt) {
      return;
    }

    if (notifiedCompletionRef.current === lastCompletionAt) {
      return;
    }
    notifiedCompletionRef.current = lastCompletionAt;

    void playSound(state.settings.notificationSound, state.settings.notificationVolume);

    if (!state.settings.enableSystemNotification) {
      return;
    }

    const title = state.timer.lastCompletion.mode === "work" ? t("notifWorkDoneTitle") : t("notifBreakDoneTitle");
    const body = state.timer.lastCompletion.mode === "work" ? t("notifWorkDoneBody") : t("notifBreakDoneBody");

    showSystemNotification(title, body);
  }, [lastCompletionAt, state.settings.enableSystemNotification, state.settings.notificationSound, state.settings.notificationVolume, state.timer.lastCompletion, t]);

  const formatDuration = useCallback(
    (seconds: number): string => formatDurationWithUnits(seconds, t("hoursUnit"), t("minutesUnit")),
    [t]
  );

  const switchMode = useCallback(
    (mode: TimerMode) => {
      setState((prev) => ({
        ...prev,
        timer: {
          ...prev.timer,
          mode,
          isRunning: false,
          secondsLeft: modeSeconds(mode, prev.settings)
        }
      }));
    },
    [setState]
  );

  const toggleRunning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        isRunning: !prev.timer.isRunning
      }
    }));
  }, [setState]);

  const resetCurrentMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        isRunning: false,
        secondsLeft: modeSeconds(prev.timer.mode, prev.settings)
      }
    }));
  }, [setState]);

  const skipCurrentMode = useCallback(() => {
    setState((prev) => {
      const nextMode = getSkippedMode(prev.timer.mode);
      return {
        ...prev,
        timer: {
          ...prev.timer,
          mode: nextMode,
          isRunning: false,
          secondsLeft: modeSeconds(nextMode, prev.settings)
        }
      };
    });
  }, [setState]);

  const addTask = useCallback(
    (name: string, estimatedMinutes: number) => {
      setState((prev) => ({
        ...prev,
        tasks: [
          {
            id: safeRandomId(),
            name,
            estimatedMinutes: Math.max(1, Math.round(estimatedMinutes)),
            createdAt: new Date().toISOString(),
            completed: false,
            actualWorkSeconds: 0,
            completedPomodoros: 0
          },
          ...prev.tasks
        ]
      }));
    },
    [setState]
  );

  const selectTaskFocus = useCallback(
    (taskId: string) => {
      setState((prev) => {
        if (prev.timer.isRunning) {
          return prev;
        }

        return {
          ...prev,
          timer: {
            ...prev.timer,
            currentTaskId: prev.timer.currentTaskId === taskId ? null : taskId
          }
        };
      });
    },
    [setState]
  );

  const reorderTask = useCallback(
    (sourceTaskId: string, targetTaskId: string) => {
      setState((prev) => {
        const sourceIndex = prev.tasks.findIndex((task) => task.id === sourceTaskId);
        const targetIndex = prev.tasks.findIndex((task) => task.id === targetTaskId);

        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
          return prev;
        }

        const nextTasks = [...prev.tasks];
        const [movedTask] = nextTasks.splice(sourceIndex, 1);
        nextTasks.splice(targetIndex, 0, movedTask);
        return {
          ...prev,
          tasks: nextTasks
        };
      });
    },
    [setState]
  );

  const startTaskFocus = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        timer: {
          ...prev.timer,
          currentTaskId: taskId,
          mode: "work",
          isRunning: true,
          secondsLeft: modeSeconds("work", prev.settings)
        }
      }));
    },
    [setState]
  );

  const cycleFocusTask = useCallback(() => {
    setState((prev) => {
      if (prev.timer.isRunning || prev.tasks.length === 0) {
        return prev;
      }

      const currentIndex = prev.tasks.findIndex((task) => task.id === prev.timer.currentTaskId);
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % prev.tasks.length;

      return {
        ...prev,
        timer: {
          ...prev.timer,
          currentTaskId: prev.tasks[nextIndex].id
        }
      };
    });
  }, [setState]);

  const stopFocusedTask = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timer: {
        ...prev.timer,
        isRunning: false,
        currentTaskId: null
      }
    }));
  }, [setState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isSettingsOpen || isHelpOpen || isInputLikeTarget(event.target) || event.repeat) {
        return;
      }

      const pressed = keyFromEvent(event);
      if (!pressed) {
        return;
      }

      if (pressed === shortcuts.startPause) {
        event.preventDefault();
        toggleRunning();
        return;
      }

      if (pressed === shortcuts.switchTask) {
        event.preventDefault();
        cycleFocusTask();
        return;
      }

      if (pressed === shortcuts.stopTask) {
        event.preventDefault();
        stopFocusedTask();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    cycleFocusTask,
    isHelpOpen,
    isSettingsOpen,
    shortcuts.startPause,
    shortcuts.stopTask,
    shortcuts.switchTask,
    stopFocusedTask,
    toggleRunning
  ]);

  const toggleTaskDone = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed
              }
            : task
        )
      }));
    },
    [setState]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== taskId),
        timer: {
          ...prev.timer,
          currentTaskId: prev.timer.currentTaskId === taskId ? null : prev.timer.currentTaskId
        }
      }));
    },
    [setState]
  );

  const updateSettings = useCallback(
    (updater: (prev: Settings) => Settings) => {
      setState((prev) => {
        const nextSettings = sanitizeSettings(updater(prev.settings));
        const syncedTimer = prev.timer.isRunning
          ? prev.timer
          : {
              ...prev.timer,
              secondsLeft: modeSeconds(prev.timer.mode, nextSettings)
            };

        return {
          ...prev,
          settings: nextSettings,
          timer: syncedTimer
        };
      });
    },
    [setState]
  );

  const previewSound = useCallback(() => {
    void playSound(state.settings.notificationSound, state.settings.notificationVolume);
  }, [state.settings.notificationSound, state.settings.notificationVolume]);

  const changeLanguage = useCallback(
    (language: LanguageCode) => {
      updateSettings((prev) => ({
        ...prev,
        language
      }));
    },
    [updateSettings]
  );

  const toggleTheme = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark"
    }));
  }, [updateSettings]);

  const toggleSystemNotification = useCallback(
    async (enabled: boolean): Promise<PermissionResult> => {
      if (!enabled) {
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            enableSystemNotification: false
          }
        }));
        return "ok";
      }

      const permission = await ensureNotificationPermission();
      if (permission === "unsupported") {
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            enableSystemNotification: false
          }
        }));
        return "unsupported";
      }

      if (permission !== "granted") {
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            enableSystemNotification: false
          }
        }));
        return "denied";
      }

      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          enableSystemNotification: true
        }
      }));
      return "ok";
    },
    [setState]
  );

  const installApp = useCallback(async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  const clearData = useCallback(() => {
    localStorage.removeItem(stateStorageKey);
    window.location.reload();
  }, []);

  return (
    <div className="relative min-h-screen px-4 py-3 sm:px-5 lg:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-red-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        <header className="animate-panel-in mb-4 h-[60px] rounded-2xl border border-white/20 bg-white/60 shadow-glow backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/75">
          <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <img src={logoSrc} alt="TomaFlow" className="h-8 w-8 rounded-lg" />
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{t("appTitle")}</h1>
              {isDemoMode ? (
                <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                  #{t("demoTag")}
                </span>
              ) : null}
            </div>

            <nav className="flex items-center gap-2">
              <label className="sr-only" htmlFor="nav-language">
                {t("language")}
              </label>
              <div className="relative">
                <Globe2 className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <select
                  id="nav-language"
                  value={state.settings.language}
                  onChange={(event) => changeLanguage(event.target.value as LanguageCode)}
                  className="h-9 rounded-xl border border-slate-300 bg-white/80 pl-7 pr-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
                  aria-label={t("language")}
                >
                  {LANGUAGE_LIST.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={t("theme")}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300 bg-white/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-rose-500"
              >
                {state.settings.theme === "dark" ? <SunMedium size={14} /> : <MoonStar size={14} />}
                {/* <span className="hidden sm:inline">{state.settings.theme === "dark" ? t("light") : t("dark")}</span> */}
              </button>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300 bg-white/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-rose-500"
              >
                <CircleHelp size={14} />
                {/* <span className="hidden sm:inline">{t("helpEntry")}</span> */}
              </button>

              <a
                href={githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300 bg-white/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-rose-500"
              >
                <Github size={14} />
              </a>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex h-9 items-center gap-1 rounded-xl bg-rose-600 px-3 text-xs font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <Settings2 size={14} />
                {/* <span className="hidden sm:inline">{t("settingsTitle")}</span> */}
              </button>

              {installPrompt ? (
                <button
                  type="button"
                  onClick={() => {
                    void installApp();
                  }}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100"
                  aria-label={t("installationHint")}
                >
                  <Download size={14} />
                </button>
              ) : null}
            </nav>
          </div>
        </header>

        <main className="space-y-5">
          <section className="grid grid-cols-1 gap-5 min-[1001px]:grid-cols-3">
            <div className="min-[1001px]:col-span-2 h-full">
              <TimerPanel
                mode={state.timer.mode}
                secondsLeft={state.timer.secondsLeft}
                totalSeconds={totalSeconds}
                isRunning={state.timer.isRunning}
                currentTaskName={currentTaskName}
                completedWorkSessions={state.timer.completedWorkSessions}
                t={t}
                onToggleRunning={toggleRunning}
                onReset={resetCurrentMode}
                onSkip={skipCurrentMode}
                onSwitchMode={switchMode}
              />
            </div>

            <TaskPanel
              tasks={state.tasks}
              currentTaskId={state.timer.currentTaskId}
              isTimerRunning={state.timer.isRunning}
              t={t}
              formatDuration={formatDuration}
              onAddTask={addTask}
              onStartTask={startTaskFocus}
              onSelectTaskFocus={selectTaskFocus}
              onReorderTask={reorderTask}
              onToggleDone={toggleTaskDone}
              onDeleteTask={deleteTask}
            />
          </section>

          <Suspense
            fallback={
              <section className="animate-panel-in rounded-3xl border border-white/20 bg-white/65 p-6 shadow-glow backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70">
                <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">{t("statsTitle")}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">...</p>
              </section>
            }
          >
            <StatsPanel
              statsByDate={state.statsByDate}
              tasks={state.tasks}
              language={state.settings.language}
              t={t}
              formatDuration={formatDuration}
            />
          </Suspense>
        </main>
      </div>

      {isHelpOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={() => setIsHelpOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("helpTitle")}
        >
          <section className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-white/95 p-6 shadow-glow dark:border-slate-700 dark:bg-slate-900" onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              aria-label={t("close")}
            >
              <X size={16} />
            </button>

            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{t("helpTitle")}</h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t("helpIntro")}</p>

            <section className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{t("helpUsageTitle")}</h3>
              <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>{t("helpUsageLine1")}</li>
                <li>{t("helpUsageLine2")}</li>
                <li>{t("helpUsageLine3")}</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{t("helpShortcutsTitle")}</h3>
              <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                <p className="flex items-center justify-between">
                  <span>{t("shortcutStartPause")}</span>
                  <kbd className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold dark:border-slate-500 dark:bg-slate-900">
                    {formatShortcutKey(shortcuts.startPause)}
                  </kbd>
                </p>
                <p className="flex items-center justify-between">
                  <span>{t("shortcutSwitchTask")}</span>
                  <kbd className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold dark:border-slate-500 dark:bg-slate-900">
                    {formatShortcutKey(shortcuts.switchTask)}
                  </kbd>
                </p>
                <p className="flex items-center justify-between">
                  <span>{t("shortcutStopTask")}</span>
                  <kbd className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold dark:border-slate-500 dark:bg-slate-900">
                    {formatShortcutKey(shortcuts.stopTask)}
                  </kbd>
                </p>
              </div>
            </section>
          </section>
        </div>
      ) : null}

      {isSettingsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={() => setIsSettingsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("settingsTitle")}
        >
          <div className="relative max-h-full w-full max-w-2xl overflow-y-auto" onMouseDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              aria-label={t("close")}
            >
              <X size={16} />
            </button>
            <SettingsPanel
              settings={settingsForView}
              t={t}
              onUpdateSettings={updateSettings}
              onPreviewSound={previewSound}
              onToggleSystemNotification={toggleSystemNotification}
              onClearData={clearData}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default App;
