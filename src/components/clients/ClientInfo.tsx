
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Contact } from "@/types/client";
import UnifiedClientInfo from "./UnifiedClientInfo";
import { DynamicCategory } from "./DynamicCategoryManager";

interface ClientInfoProps {
  clientData: Contact | null;
  dynamicFields?: {
    basic: DynamicCategory[];
    commercial: DynamicCategory[];
    personalized: DynamicCategory[];
    documents: DynamicCategory[];
  };
  onFieldUpdate?: (fieldId: string, newValue: unknown) => void;
  context: "chat" | "table" | "details" | "edit";
  compact?: boolean;
}

/**
 * Componente para exibir informações do cliente em diferentes contextos
 * Este componente serve como um wrapper para o UnifiedClientInfo, configurando-o
 * de acordo com o contexto em que está sendo usado.
 */
const ClientInfo: React.FC<ClientInfoProps> = ({
  clientData,
  dynamicFields = {
    basic: [],
    commercial: [],
    personalized: [],
    documents: [],
  },
  onFieldUpdate,
  context,
  compact = false,
}) => {
  // Configurações específicas para cada contexto
  const contextConfig = {
    chat: {
      showTabs: ["basic", "commercial", "utm", "custom", "docs"],
      readOnly: true,
      compact: true,
      className: "h-[500px] max-h-[500px]"
    },
    table: {
      showTabs: ["basic", "commercial"],
      readOnly: true,
      compact: true,
      className: "max-h-96"
    },
    details: {
      showTabs: ["basic", "commercial", "utm", "custom", "docs"],
      readOnly: true,
      compact: false,
      className: "min-h-[600px]"
    },
    edit: {
      showTabs: ["basic", "commercial", "utm", "custom", "docs"],
      readOnly: false,
      compact: false,
      className: "min-h-[600px]"
    },
  };

  const config = contextConfig[context];

  return (
    <Card className={`w-full overflow-hidden bg-background border-border ${config.className}`}>
      <CardContent className="p-0 h-full bg-background">
        <UnifiedClientInfo
          clientData={clientData}
          dynamicFields={dynamicFields}
          onFieldUpdate={onFieldUpdate}
          readOnly={config.readOnly}
          compact={compact || config.compact}
          showTabs={config.showTabs}
        />
      </CardContent>
    </Card>
  );
};

export default ClientInfo;
