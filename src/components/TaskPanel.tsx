import { CheckCircle2, GripVertical, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TranslationKey } from "../i18n";
import type { Task } from "../types";

type TaskPanelProps = {
  tasks: Task[];
  currentTaskId: string | null;
  isTimerRunning: boolean;
  t: (key: TranslationKey) => string;
  formatDuration: (seconds: number) => string;
  onAddTask: (name: string, estimatedMinutes: number) => void;
  onStartTask: (taskId: string) => void;
  onSelectTaskFocus: (taskId: string) => void;
  onReorderTask: (sourceTaskId: string, targetTaskId: string) => void;
  onToggleDone: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

export const TaskPanel = ({
  tasks,
  currentTaskId,
  isTimerRunning,
  t,
  formatDuration,
  onAddTask,
  onStartTask,
  onSelectTaskFocus,
  onReorderTask,
  onToggleDone,
  onDeleteTask
}: TaskPanelProps): JSX.Element => {
  const [name, setName] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const submitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = name.trim();
    if (!normalized) {
      return;
    }

    onAddTask(normalized, estimatedMinutes);
    setName("");
    setEstimatedMinutes(25);
  };

  const handleDrop = (targetTaskId: string) => {
    if (!draggingTaskId || draggingTaskId === targetTaskId) {
      return;
    }

    onReorderTask(draggingTaskId, targetTaskId);
  };

  const handleSelectTask = (taskId: string) => {
    if (isTimerRunning) {
      return;
    }
    onSelectTaskFocus(taskId);
  };

  return (
    <section
      className="animate-panel-in rounded-3xl border border-white/20 bg-white/65 p-6 shadow-glow backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70"
      style={{ animationDelay: "120ms" }}
    >
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{t("tasksTitle")}</h2>

      <p className="mb-4 text-xs text-slate-500 dark:text-slate-300">{t("taskCardHint")}</p>

      <form className="mb-5 space-y-3" onSubmit={submitTask}>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300" htmlFor="task-name">
          {t("taskName")}
        </label>
        <input
          id="task-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder={t("taskName")}
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300" htmlFor="task-estimated-minutes">
          {t("estimatedMinutes")}
        </label>
        <input
          id="task-estimated-minutes"
          type="number"
          min={1}
          max={600}
          value={estimatedMinutes}
          onChange={(event) => setEstimatedMinutes(Number(event.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {t("addTask")}
        </button>
      </form>

      <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            {t("emptyTask")}
          </p>
        ) : null}

        {tasks.map((task) => {
          const active = currentTaskId === task.id;
          const dragged = draggingTaskId === task.id;
          return (
            <article
              key={task.id}
              role="button"
              tabIndex={0}
              aria-disabled={isTimerRunning}
              draggable
              onClick={() => handleSelectTask(task.id)}
              onKeyDown={(event) => {
                if (isTimerRunning) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectTaskFocus(task.id);
                }
              }}
              onDragStart={() => setDraggingTaskId(task.id)}
              onDragEnd={() => setDraggingTaskId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(task.id);
                setDraggingTaskId(null);
              }}
              className={`rounded-2xl border px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                active
                  ? "border-cyan-400 bg-cyan-100/60 dark:border-cyan-500 dark:bg-cyan-950/30"
                  : "border-slate-200 bg-white/75 dark:border-slate-700 dark:bg-slate-800/60"
              } ${dragged ? "opacity-60" : "opacity-100"} ${isTimerRunning ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <header className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{task.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {t("status")}: {task.completed ? t("done") : t("active")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {active ? (
                    <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">{t("focusNow")}</span>
                  ) : null}
                  <span className="rounded-lg border border-slate-300 bg-white/80 p-1 text-slate-500 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-300" aria-label={t("dragToSort")}> 
                    <GripVertical size={12} />
                  </span>
                </div>
              </header>

              <dl className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex gap-2">
                  <dt className="font-medium">{t("estimated")}</dt>
                  <dd>{task.estimatedMinutes} {t("minutesUnit")}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium">{t("actual")}</dt>
                  <dd>{formatDuration(task.actualWorkSeconds)}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onStartTask(task.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                >
                  <Play size={14} />
                  {t("startTask")}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleDone(task.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <CheckCircle2 size={14} />
                  {task.completed ? t("reopenTask") : t("markDone")}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
