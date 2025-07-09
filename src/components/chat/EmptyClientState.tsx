import React from 'react';
import { Anchor } from "lucide-react";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

interface EmptyClientStateProps {
  message: string;
  subtitle: string;
}

const EmptyClientState = React.memo(({ message, subtitle }: EmptyClientStateProps) => {
  const { settings } = useThemeSettings();

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <Anchor
        size={64}
        className="mb-4 opacity-50"
        style={{ color: settings.primaryColor }}
      />
      <h3 className="text-xl font-medium mb-2">{message}</h3>
      <p className="text-sm text-center px-4">{subtitle}</p>
    </div>
  );
});

EmptyClientState.displayName = 'EmptyClientState';

export default EmptyClientState;