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
    <div className="text-center p-6 border-b border-gray-200 dark:border-gray-700">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
        style={{
          backgroundColor: `${settings.secondaryColor}20`,
          color: settings.primaryColor,
        }}
      >
        ⚓
      </div>
      <h2 className="text-xl font-semibold">
        {clientData?.name || selectedConversation?.name}
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        {clientData?.phone || selectedConversation?.phone}
      </p>
      {clientData?.address && (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {clientData.address}
        </p>
      )}
      {clientData?.kanbanStage && (
        <Badge variant="outline" className="mt-2">
          {clientData.kanbanStage}
        </Badge>
      )}
    </div>
  );
});

ClientHeader.displayName = 'ClientHeader';

export default ClientHeader;