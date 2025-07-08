import React from "react";
import { ShipWheel } from "lucide-react";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

const NoSelectedChat = () => {
  const { settings } = useThemeSettings();

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <ShipWheel
        size={64}
        className="mb-4 opacity-50"
        style={{ color: settings.primaryColor }}
      />
      <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
      <p className="text-sm">
        Escolha uma conversa para começar a navegar pelas águas da comunicação
      </p>
    </div>
  );
};

export default NoSelectedChat;
