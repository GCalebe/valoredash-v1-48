import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/client";
import { DynamicCategory } from "@/components/clients/DynamicCategoryManager";
import ClientUTMData from "./ClientUTMData";

interface UnifiedClientInfoProps {
  clientData: Contact | null;
  dynamicFields?: {
    basic: DynamicCategory[];
    commercial: DynamicCategory[];
    personalized: DynamicCategory[];
    documents: DynamicCategory[];
  };
  onFieldUpdate?: (fieldId: string, newValue: any) => void;
  readOnly?: boolean;
  compact?: boolean;
  showTabs?: string[];
}

const UnifiedClientInfo: React.FC<UnifiedClientInfoProps> = ({
  clientData,
  dynamicFields = {
    basic: [],
    commercial: [],
    personalized: [],
    documents: [],
  },
  onFieldUpdate,
  readOnly = true,
  compact = false,
  showTabs = ["basic", "commercial", "utm", "custom", "docs"],
}) => {
  const renderField = (
    label: string,
    value: any,
    type: "text" | "badge" | "money" = "text",
  ) => {
    if (!value && value !== 0) {
      value = "Não informado";
    }

    return (
      <div className={`${compact ? "mb-2" : "mb-4"}`}>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </h3>
        {type === "badge" ? (
          <Badge variant="outline">{value}</Badge>
        ) : type === "money" ? (
          <p>{typeof value === "number" ? `R$ ${value.toFixed(2)}` : value}</p>
        ) : (
          <p>{value}</p>
        )}
      </div>
    );
  };

  const renderBasicInfo = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        {renderField("Nome", clientData?.name)}
        {renderField("Email", clientData?.email)}
        {renderField("Telefone", clientData?.phone)}
        {renderField("Nome do Cliente", clientData?.clientName)}
        {renderField("Tipo de Cliente", clientData?.clientType)}
        {renderField("Tamanho do Cliente", clientData?.clientSize)}
        {renderField("CPF/CNPJ", clientData?.cpfCnpj)}
        {renderField("Endereço", clientData?.address)}
      </CardContent>
    </Card>
  );

  const renderCommercialInfo = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Informações Comerciais</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        {renderField("Status", clientData?.status, "badge")}
        {renderField("Etapa do Funil", clientData?.kanbanStage, "badge")}
        {renderField(
          "Etapa da Consulta",
          clientData?.consultationStage,
          "badge",
        )}
        {renderField("Setor do Cliente", clientData?.clientSector)}
        {renderField("Usuário Responsável", clientData?.responsibleUser)}
        {renderField("Vendas", clientData?.sales)}
        {renderField("Orçamento", clientData?.budget, "money")}
        {renderField("Método de Pagamento", clientData?.paymentMethod)}
        {renderField("Objetivo do Cliente", clientData?.clientObjective)}
        {renderField("Motivo de Perda", clientData?.lossReason)}
        {renderField("Número de Contrato", clientData?.contractNumber)}
        {renderField("Data de Contrato", clientData?.contractDate)}
        {renderField("Pagamento", clientData?.payment)}
      </CardContent>
    </Card>
  );

  const renderUTMData = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Dados UTM</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {clientData?.id ? (
          <ClientUTMData contactId={clientData.id} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Dados UTM não disponíveis para este cliente.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderCustomFields = () => {
    if (!dynamicFields.personalized.length) {
      return (
        <Card className={compact ? "p-3" : "p-4"}>
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg">Campos Personalizados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum campo personalizado configurado.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={compact ? "p-3" : "p-4"}>
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-lg">Campos Personalizados</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          {dynamicFields.personalized.map((field) => {
            const value = clientData?.customValues?.[field.id];
            return renderField(field.name, value);
          })}
        </CardContent>
      </Card>
    );
  };

  const renderDocuments = () => {
    if (!dynamicFields.documents.length) {
      return (
        <Card className={compact ? "p-3" : "p-4"}>
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg">Documentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum documento configurado.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={compact ? "p-3" : "p-4"}>
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-lg">Documentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          {dynamicFields.documents.map((field) => {
            const value = clientData?.customValues?.[field.id];
            return renderField(field.name, value);
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList
          className="w-full grid"
          style={{ gridTemplateColumns: `repeat(${showTabs.length}, 1fr)` }}
        >
          {showTabs.includes("basic") && (
            <TabsTrigger value="basic">Básico</TabsTrigger>
          )}
          {showTabs.includes("commercial") && (
            <TabsTrigger value="commercial">Comercial</TabsTrigger>
          )}
          {showTabs.includes("utm") && (
            <TabsTrigger value="utm">UTM</TabsTrigger>
          )}
          {showTabs.includes("custom") && (
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          )}
          {showTabs.includes("docs") && (
            <TabsTrigger value="docs">Documentos</TabsTrigger>
          )}
        </TabsList>

        {showTabs.includes("basic") && (
          <TabsContent value="basic" className="mt-4">
            {renderBasicInfo()}
          </TabsContent>
        )}

        {showTabs.includes("commercial") && (
          <TabsContent value="commercial" className="mt-4">
            {renderCommercialInfo()}
          </TabsContent>
        )}

        {showTabs.includes("utm") && (
          <TabsContent value="utm" className="mt-4">
            {renderUTMData()}
          </TabsContent>
        )}

        {showTabs.includes("custom") && (
          <TabsContent value="custom" className="mt-4">
            {renderCustomFields()}
          </TabsContent>
        )}

        {showTabs.includes("docs") && (
          <TabsContent value="docs" className="mt-4">
            {renderDocuments()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UnifiedClientInfo;
