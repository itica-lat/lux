import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { createElement } from "react";
import type { FontSize, ThemeSettings } from "@/lib/types";

interface ThemeContextType extends ThemeSettings {
  toggleTheme: () => void;
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  toggleDyslexicFont: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "lux_theme";

function loadSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ThemeSettings; // Parseo de datos de theme y accesibilidad
  } catch {
    // ignore
  }
  return { theme: "light", fontSize: "md", highContrast: false, dyslexicFont: false }; // En caso de no tener datos se ponen datos por default
}

function applySettings(settings: ThemeSettings): void {
  const html = document.documentElement;
  if (settings.theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  html.setAttribute("data-font-size", settings.fontSize);
  html.setAttribute("data-contrast", settings.highContrast ? "high" : "normal");
  html.setAttribute("data-dyslexic", String(settings.dyslexicFont));
} // Aplicacion de configuracion en base a elementos html mediante tailwind

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]); // Utilizando el metodo de useEffect de react se aplican las configuraciones

  const toggleTheme = useCallback(() => {
    setSettings((s) => ({ ...s, theme: s.theme === "light" ? "dark" : "light" }));
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setSettings((s) => ({ ...s, fontSize: size }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((s) => ({ ...s, highContrast: !s.highContrast }));
  }, []);

  const toggleDyslexicFont = useCallback(() => {
    setSettings((s) => ({ ...s, dyslexicFont: !s.dyslexicFont }));
  }, []);

  return createElement(
    ThemeContext.Provider,
    {
      value: {
        ...settings,
        toggleTheme,
        setFontSize,
        toggleHighContrast,
        toggleDyslexicFont,
      },
    },
    children,
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
