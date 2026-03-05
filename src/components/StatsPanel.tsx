import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TranslationKey } from "../i18n";
import { formatDateLabel } from "../lib/time";
import type { DayStat, Task } from "../types";

type StatsPanelProps = {
  statsByDate: Record<string, DayStat>;
  tasks: Task[];
  language: string;
  t: (key: TranslationKey) => string;
  formatDuration: (seconds: number) => string;
};

const PIE_COLORS = ["#ef4444", "#f97316", "#fb7185", "#dc2626", "#f59e0b", "#e11d48", "#fb923c", "#be123c"];

export const StatsPanel = ({ statsByDate, tasks, language, t, formatDuration }: StatsPanelProps): JSX.Element => {
  const {
    totalWorkSeconds,
    totalBreakSeconds,
    totalPomodoros,
    focusRate,
    dailyTaskRows,
    lineData,
    barData,
    pieData
  } = useMemo(() => {
    const dayStats = Object.values(statsByDate).sort((a, b) => a.date.localeCompare(b.date));
    const taskNameMap = new Map(tasks.map((task) => [task.id, task.name]));

    const totalWork = dayStats.reduce((sum, item) => sum + item.workSeconds, 0);
    const totalBreak = dayStats.reduce((sum, item) => sum + item.breakSeconds, 0);
    const pomodoros = dayStats.reduce((sum, item) => sum + item.pomodoros, 0);
    const focus = totalWork + totalBreak > 0 ? totalWork / (totalWork + totalBreak) : 0;

    const rows = dayStats.flatMap((item) =>
      Object.entries(item.taskSeconds)
        .filter(([, seconds]) => seconds > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([taskId, seconds]) => ({
          date: item.date,
          taskName: taskNameMap.get(taskId) ?? `#${taskId.slice(0, 6)}`,
          seconds
        }))
    );

    const line = dayStats.map((item) => ({
      dateLabel: formatDateLabel(item.date, language),
      workHours: Number((item.workSeconds / 3600).toFixed(2))
    }));

    const bar = dayStats.map((item) => ({
      dateLabel: formatDateLabel(item.date, language),
      pomodoros: item.pomodoros
    }));

    const pieAcc = new Map<string, number>();
    rows.forEach((row) => {
      pieAcc.set(row.taskName, (pieAcc.get(row.taskName) ?? 0) + row.seconds);
    });

    const pie = Array.from(pieAcc.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalWorkSeconds: totalWork,
      totalBreakSeconds: totalBreak,
      totalPomodoros: pomodoros,
      focusRate: focus,
      dailyTaskRows: rows,
      lineData: line,
      barData: bar,
      pieData: pie
    };
  }, [statsByDate, tasks, language]);

  const metricCards = [
    { title: t("totalWork"), value: formatDuration(totalWorkSeconds) },
    { title: t("totalBreak"), value: formatDuration(totalBreakSeconds) },
    { title: t("completedPomodoros"), value: `${totalPomodoros}` },
    { title: t("focusRate"), value: `${Math.round(focusRate * 100)}%` }
  ];

  return (
    <section
      className="animate-panel-in rounded-3xl border border-white/20 bg-white/65 p-6 shadow-glow backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70"
      style={{ animationDelay: "200ms" }}
    >
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{t("statsTitle")}</h2>

      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">{t("allTimeStats")}</p>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <article key={metric.title} className="rounded-2xl border border-slate-200 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs text-slate-500 dark:text-slate-300">{metric.title}</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{metric.value}</p>
          </article>
        ))}
      </div>

      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("dailyTaskTable")}</h3>
        <div className="max-h-[240px] overflow-auto rounded-2xl border border-slate-200 bg-white/75 dark:border-slate-700 dark:bg-slate-800/60">
          <table className="w-full min-w-[420px] text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="sticky top-0 bg-slate-100/95 dark:bg-slate-900/95">
              <tr>
                <th className="px-3 py-2">{t("date")}</th>
                <th className="px-3 py-2">{t("task")}</th>
                <th className="px-3 py-2">{t("duration")}</th>
              </tr>
            </thead>
            <tbody>
              {dailyTaskRows.slice(0, 120).map((row) => (
                <tr key={`${row.date}-${row.taskName}`} className="border-t border-slate-200/70 dark:border-slate-700/70">
                  <td className="px-3 py-2">{row.date}</td>
                  <td className="px-3 py-2">{row.taskName}</td>
                  <td className="px-3 py-2">{formatDuration(row.seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dailyTaskRows.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-300">{t("noData")}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{t("dailyWorkLine")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="workHours"
                  name={t("chartLegendWork")}
                  stroke="#ef4444"
                  strokeWidth={2.4}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{t("taskSharePie")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={34} paddingAngle={2}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatDuration(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-800/60 xl:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{t("pomodoroBar")}</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pomodoros" fill="#f97316" radius={[6, 6, 0, 0]} name={t("chartLegendPomodoro")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
};
