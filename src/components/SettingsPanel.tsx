import { BellRing, Keyboard, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { TranslationKey } from "../i18n";
import { LANGUAGE_LIST, SOUND_OPTIONS } from "../lib/state";
import type { LanguageCode, Settings, ShortcutSettings, SoundPreset, ThemeMode } from "../types";

type PermissionResult = "ok" | "unsupported" | "denied";

type ShortcutField = keyof ShortcutSettings;

type SettingsPanelProps = {
  settings: Settings;
  t: (key: TranslationKey) => string;
  onUpdateSettings: (updater: (prev: Settings) => Settings) => void;
  onPreviewSound: () => void;
  onToggleSystemNotification: (enabled: boolean) => Promise<PermissionResult>;
  onClearData: () => void;
};

const numberInputClass =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const toShortcutKey = (event: KeyboardEvent): string | null => {
  if (event.code === "Space" || event.key === " ") {
    return " ";
  }

  const key = event.key.toLowerCase();
  if (key.length === 1) {
    return key;
  }

  return null;
};

const shortcutDisplay = (value: string, t: (key: TranslationKey) => string): string => {
  if (value === " ") {
    return t("spaceKey");
  }
  return value.toUpperCase();
};

export const SettingsPanel = ({ settings, t, onUpdateSettings, onPreviewSound, onToggleSystemNotification, onClearData }: SettingsPanelProps): JSX.Element => {
  const [notificationFeedback, setNotificationFeedback] = useState<string>("");
  const [editingShortcut, setEditingShortcut] = useState<ShortcutField | null>(null);

  const handleToggleNotification = async (enabled: boolean) => {
    const result = await onToggleSystemNotification(enabled);
    if (result === "unsupported") {
      setNotificationFeedback(t("notificationUnsupported"));
      return;
    }

    if (result === "denied") {
      setNotificationFeedback(t("notificationDenied"));
      return;
    }

    setNotificationFeedback("");
  };

  useEffect(() => {
    if (!editingShortcut) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setEditingShortcut(null);
        return;
      }

      const nextKey = toShortcutKey(event);
      if (!nextKey) {
        return;
      }

      event.preventDefault();
      onUpdateSettings((prev) => ({
        ...prev,
        shortcuts: {
          ...prev.shortcuts,
          [editingShortcut]: nextKey
        }
      }));
      setEditingShortcut(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editingShortcut, onUpdateSettings]);

  const patchNumber = (field: keyof Pick<Settings, "workMinutes" | "shortBreakMinutes" | "longBreakMinutes" | "longBreakInterval">, value: number) => {
    onUpdateSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const shortcutItems: Array<{ field: ShortcutField; labelKey: TranslationKey }> = [
    { field: "startPause", labelKey: "shortcutStartPause" },
    { field: "switchTask", labelKey: "shortcutSwitchTask" },
    { field: "stopTask", labelKey: "shortcutStopTask" }
  ];

  return (
    <section className="animate-panel-in rounded-3xl border border-white/20 bg-white/65 p-6 shadow-glow backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/70">
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">{t("settingsTitle")}</h2>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("workMinutes")}
          <input
            className={numberInputClass}
            type="number"
            min={1}
            max={180}
            value={settings.workMinutes}
            onChange={(event) => patchNumber("workMinutes", Number(event.target.value))}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("shortBreakMinutes")}
          <input
            className={numberInputClass}
            type="number"
            min={1}
            max={60}
            value={settings.shortBreakMinutes}
            onChange={(event) => patchNumber("shortBreakMinutes", Number(event.target.value))}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("longBreakMinutes")}
          <input
            className={numberInputClass}
            type="number"
            min={1}
            max={120}
            value={settings.longBreakMinutes}
            onChange={(event) => patchNumber("longBreakMinutes", Number(event.target.value))}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("longBreakInterval")}
          <input
            className={numberInputClass}
            type="number"
            min={2}
            max={8}
            value={settings.longBreakInterval}
            onChange={(event) => patchNumber("longBreakInterval", Number(event.target.value))}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("sound")}
          <select
            className={numberInputClass}
            value={settings.notificationSound}
            onChange={(event) =>
              onUpdateSettings((prev) => ({
                ...prev,
                notificationSound: event.target.value as SoundPreset
              }))
            }
          >
            {SOUND_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {t(item.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onPreviewSound}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-200"
        >
          <BellRing size={16} />
          {t("preview")}
        </button>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="mb-1 inline-flex items-center gap-2">
            <Volume2 size={16} />
            {t("volume")}: {Math.round(settings.notificationVolume * 100)}%
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.notificationVolume}
            onChange={(event) =>
              onUpdateSettings((prev) => ({
                ...prev,
                notificationVolume: Number(event.target.value)
              }))
            }
            className="w-full accent-rose-500"
          />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          {t("systemNotification")}
          <input
            type="checkbox"
            checked={settings.enableSystemNotification}
            onChange={(event) => {
              void handleToggleNotification(event.target.checked);
            }}
            className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
          />
        </label>

        {notificationFeedback ? <p className="text-xs text-rose-600 dark:text-rose-300">{notificationFeedback}</p> : null}

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("language")}
          <select
            className={numberInputClass}
            value={settings.language}
            onChange={(event) =>
              onUpdateSettings((prev) => ({
                ...prev,
                language: event.target.value as LanguageCode
              }))
            }
          >
            {LANGUAGE_LIST.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">{t("theme")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["light", t("light")],
              ["dark", t("dark")]
            ] as const).map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                  settings.theme === value
                    ? "border-rose-400 bg-rose-100/70 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200"
                    : "border-slate-200 bg-white/70 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  className="sr-only"
                  checked={settings.theme === value}
                  onChange={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      theme: value as ThemeMode
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Keyboard size={15} />
            {t("shortcutSettingsTitle")}
          </h3>

          <div className="space-y-2">
            {shortcutItems.map((item) => {
              const active = editingShortcut === item.field;
              return (
                <button
                  key={item.field}
                  type="button"
                  onClick={() => setEditingShortcut(item.field)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? "border-rose-400 bg-rose-100 text-rose-700 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200"
                      : "border-slate-300 bg-white text-slate-700 hover:border-rose-300 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200"
                  }`}
                >
                  <span className="font-medium">{t(item.labelKey)}</span>
                  <kbd className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-bold dark:border-slate-500 dark:bg-slate-800">
                    {shortcutDisplay(settings.shortcuts[item.field], t)}
                  </kbd>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-300">
            {editingShortcut ? t("shortcutPressAnyKey") : t("shortcutEditHint")}
          </p>
        </section>

        <button
          type="button"
          onClick={() => {
            if (confirm(t("clearDataConfirm"))) {
              onClearData();
            }
          }}
          className="w-full rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
        >
          {t("clearData")}
        </button>
      </div>
    </section>
  );
};
