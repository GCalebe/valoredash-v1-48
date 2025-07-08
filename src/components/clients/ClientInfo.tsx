
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  onFieldUpdate?: (fieldId: string, newValue: any) => void;
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
      title: "Informações do Cliente",
      description: "Detalhes do cliente na conversa atual",
      showTabs: ["basic", "commercial", "utm", "custom", "docs"],
      readOnly: true,
      compact: false,
    },
    table: {
      title: "Resumo do Cliente",
      description: "Informações resumidas",
      showTabs: ["basic", "commercial"],
      readOnly: true,
      compact: true,
    },
    details: {
      title: "Detalhes do Cliente",
      description: "Informações completas",
      showTabs: ["basic", "commercial", "utm", "custom", "docs"],
      readOnly: true,
      compact: false,
    },
    edit: {
      title: "Editar Cliente",
      description: "Edite as informações do cliente",
      showTabs: ["basic", "commercial", "utm", "custom", "docs"],
      readOnly: false,
      compact: false,
    },
  };

  const config = contextConfig[context];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <p className="text-sm text-gray-500">{config.description}</p>
      </CardHeader>
      <CardContent>
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
