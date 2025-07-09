import { useThemeSettings as useThemeSettingsContext } from '@/context/ThemeSettingsContext';

// Enhanced hook for compatibility with optimized components
export function useThemeSettings() {
  const { settings } = useThemeSettingsContext();
  
  return {
    themeSettings: {
      chatBackgroundColor: settings.primaryColor + '10', // Add some transparency
      chatBubbleColor: settings.primaryColor,
      chatBubbleTextColor: '#ffffff',
    },
    settings,
  };
}