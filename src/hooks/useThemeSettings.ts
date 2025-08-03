import { useThemeSettings as useThemeSettingsContext } from "@/context/ThemeSettingsContext";

export const useThemeSettings = () => {
  const context = useThemeSettingsContext();
  
  if (!context) {
    throw new Error("useThemeSettings must be used within a ThemeSettingsProvider");
  }

  const { settings, loading, initialized } = context;

  // Derive chat colors from primary color
  const chatBackgroundColor = settings.primaryColor + "10"; // 10% opacity
  const chatBubbleColor = settings.primaryColor;
  const chatBubbleTextColor = "#ffffff";

  return {
    ...context,
    chatBackgroundColor,
    chatBubbleColor,
    chatBubbleTextColor,
    loading,
    initialized,
  };
};