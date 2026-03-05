import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { TranslationKey } from "../i18n";
import { modeLabelKey } from "../i18n";
import { MODE_OPTIONS } from "../lib/state";
import { secondsToClock } from "../lib/time";
import type { TimerMode } from "../types";

type TimerPanelProps = {
  mode: TimerMode;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  currentTaskName: string;
  completedWorkSessions: number;
  t: (key: TranslationKey) => string;
  onToggleRunning: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: TimerMode) => void;
};

const MODE_THEME: Record<TimerMode, { ring: string; glow: string }> = {
  work: {
    ring: "#ef4444",
    glow: "rgba(239, 68, 68, 0.38)"
  },
  shortBreak: {
    ring: "#fb923c",
    glow: "rgba(251, 146, 60, 0.36)"
  },
  longBreak: {
    ring: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.34)"
  }
};

export const TimerPanel = ({
  mode,
  secondsLeft,
  totalSeconds,
  isRunning,
  currentTaskName,
  completedWorkSessions,
  t,
  onToggleRunning,
  onReset,
  onSkip,
  onSwitchMode
}: TimerPanelProps): JSX.Element => {
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const theme = MODE_THEME[mode];

  return (
    <section className="animate-panel-in rounded-3xl border border-white/20 bg-white/65 p-6 h-full shadow-glow backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70 sm:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("timerTitle")}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("currentTask")}: <span className="font-semibold">{currentTaskName}</span>
          </p>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
          {t("completedPomodoros")}: {completedWorkSessions}
        </span>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODE_OPTIONS.map((item) => {
          const active = item === mode;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSwitchMode(item)}
              aria-pressed={active}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                active
                  ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-200"
                  : "border-slate-200 bg-white/70 text-slate-700 hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-rose-500"
              }`}
            >
              {t(modeLabelKey(item))}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mb-8 flex w-full max-w-sm justify-center">
        <div
          className="relative flex h-60 w-60 items-center justify-center rounded-full p-4 shadow-2xl sm:h-72 sm:w-72"
          style={{
            background: `conic-gradient(${theme.ring} ${Math.max(progress * 360, 0.5)}deg, rgba(148, 163, 184, 0.22) 0deg)`,
            boxShadow: `0 18px 50px ${theme.glow}`
          }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white/90 text-center dark:bg-slate-950/95">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t(modeLabelKey(mode))}</p>
            <p aria-live="polite" className="text-5xl font-black tabular-nums text-slate-900 dark:text-slate-50 sm:text-6xl">
              {secondsToClock(secondsLeft)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onToggleRunning}
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? t("pause") : t("start")}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100"
        >
          <RotateCcw size={16} />
          {t("reset")}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100"
        >
          <SkipForward size={16} />
          {t("skip")}
        </button>
      </div>
    </section>
  );
};
