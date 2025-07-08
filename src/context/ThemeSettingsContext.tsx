import { createContext, useContext, useEffect, useState } from "react";

export interface ThemeSettings {
  brandName: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

type ThemeSettingsContextType = {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
};

const defaultSettings: ThemeSettings = {
  brandName: "Valore Náutico",
  logo: null,
  primaryColor: "#1e40af",
  secondaryColor: "#f59e0b",
  accentColor: "#1e3a8a",
};

const ThemeSettingsContext = createContext<
  ThemeSettingsContextType | undefined
>(undefined);

export function ThemeSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem("valore-theme-settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("valore-theme-settings", JSON.stringify(settings));

    // Apply theme colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty("--valore-blue", settings.primaryColor);
    root.style.setProperty("--valore-gold", settings.secondaryColor);
    root.style.setProperty("--valore-navy", settings.accentColor);
  }, [settings]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <ThemeSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export const useThemeSettings = () => {
  const context = useContext(ThemeSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useThemeSettings must be used within a ThemeSettingsProvider",
    );
  }
  return context;
};
