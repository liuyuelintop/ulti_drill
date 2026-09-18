import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_THEME,
  FIELD_THEMES,
  type FieldThemeName,
} from "../features/field/theme";

const KEY = "ulti.fieldTheme";
/** Every mounted stage should flip together, not just the one that was clicked. */
const EVENT = "ulti:fieldtheme";

const read = (): FieldThemeName => {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && stored in FIELD_THEMES) return stored as FieldThemeName;
  } catch {
    /* private mode — fall through to the default */
  }
  return DEFAULT_THEME;
};

/**
 * Grass or flat diagram, remembered per device. Diagram is the one to reach for
 * in direct sunlight or when a play is going to be printed.
 */
export const useFieldTheme = () => {
  const [themeName, setThemeName] = useState<FieldThemeName>(read);

  useEffect(() => {
    const sync = () => setThemeName(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setTheme = useCallback((next: FieldThemeName) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* not being able to remember it is not a reason to not apply it */
    }
    setThemeName(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(read() === "grass" ? "diagram" : "grass"),
    [setTheme]
  );

  return { themeName, setTheme, toggleTheme };
};
