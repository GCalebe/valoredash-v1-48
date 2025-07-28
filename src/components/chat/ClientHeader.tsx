import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types/client";
import { Conversation } from "@/types/chat";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

interface ClientHeaderProps {
  clientData: Contact | null;
  selectedConversation: Conversation | undefined;
}

const ClientHeader = React.memo(({ clientData, selectedConversation }: ClientHeaderProps) => {
  const { settings } = useThemeSettings();

  return (
    <div className="text-center p-3 border-b border-gray-200 dark:border-gray-700">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-2"
        style={{
          backgroundColor: `${settings.secondaryColor}20`,
          color: settings.primaryColor,
        }}
      >
        ⚓
      </div>
      <h2 className="text-lg font-semibold">
        {clientData?.name || selectedConversation?.name}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {clientData?.phone || selectedConversation?.phone}
      </p>
      {clientData?.kanbanStage && (
        <Badge variant="outline" className="mt-1 text-xs">
          {clientData.kanbanStage}
        </Badge>
      )}
    </div>
  );
});

ClientHeader.displayName = 'ClientHeader';

export default ClientHeader;