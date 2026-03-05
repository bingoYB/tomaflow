import { useEffect, useState } from "react";

export const useLocalStorageState = <T,>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return fallback;
    }

    const cached = window.localStorage.getItem(key);
    if (!cached) {
      return fallback;
    }

    try {
      return JSON.parse(cached) as T;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
