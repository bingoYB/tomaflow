export const secondsToClock = (seconds: number): string => {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(clamped % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
};

export const todayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateLabel = (dateKey: string, locale: string): string => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric"
  }).format(date);
};

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
