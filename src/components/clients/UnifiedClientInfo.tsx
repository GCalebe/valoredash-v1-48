
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/client";
import { DynamicCategory } from "@/components/clients/DynamicCategoryManager";
import ClientUTMData from "./ClientUTMData";
import EditableField from "./EditableField";

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
  const consultationStageOptions = [
    "Nova consulta",
    "Qualificado", 
    "Chamada agendada",
    "Preparando proposta",
    "Proposta enviada",
    "Acompanhamento",
    "Negociação",
    "Fatura enviada",
    "Fatura paga – ganho",
    "Projeto cancelado – perdido"
  ];

  const clientTypeOptions = [
    "Pessoa Física",
    "Pessoa Jurídica",
    "MEI",
    "Empresa"
  ];

  const clientSizeOptions = [
    "Pequeno",
    "Médio", 
    "Grande"
  ];

  const renderBasicInfo = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <EditableField
          label="Nome"
          value={clientData?.name}
          fieldId="name"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Email"
          value={clientData?.email}
          fieldId="email"
          type="email"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Telefone"
          value={clientData?.phone}
          fieldId="phone"
          type="tel"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Nome do Cliente"
          value={clientData?.clientName}
          fieldId="clientName"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Tipo de Cliente"
          value={clientData?.clientType}
          fieldId="clientType"
          type="select"
          options={clientTypeOptions}
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Tamanho do Cliente"
          value={clientData?.clientSize}
          fieldId="clientSize"
          type="select"
          options={clientSizeOptions}
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="CPF/CNPJ"
          value={clientData?.cpfCnpj}
          fieldId="cpfCnpj"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Endereço"
          value={clientData?.address}
          fieldId="address"
          type="textarea"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
      </CardContent>
    </Card>
  );

  const renderCommercialInfo = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Informações Comerciais</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <EditableField
          label="Status"
          value={clientData?.status}
          fieldId="status"
          type={readOnly ? "badge" : "select"}
          options={["Active", "Inactive"]}
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Etapa da Consulta"
          value={clientData?.consultationStage}
          fieldId="consultationStage"
          type={readOnly ? "badge" : "select"}
          options={consultationStageOptions}
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Setor do Cliente"
          value={clientData?.clientSector}
          fieldId="clientSector"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Usuário Responsável"
          value={clientData?.responsibleUser}
          fieldId="responsibleUser"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Vendas"
          value={clientData?.sales}
          fieldId="sales"
          type="money"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Orçamento"
          value={clientData?.budget}
          fieldId="budget"
          type="money"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Método de Pagamento"
          value={clientData?.paymentMethod}
          fieldId="paymentMethod"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Objetivo do Cliente"
          value={clientData?.clientObjective}
          fieldId="clientObjective"
          type="textarea"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Motivo de Perda"
          value={clientData?.lossReason}
          fieldId="lossReason"
          type="textarea"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Número de Contrato"
          value={clientData?.contractNumber}
          fieldId="contractNumber"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Data de Contrato"
          value={clientData?.contractDate}
          fieldId="contractDate"
          type="text"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
        <EditableField
          label="Pagamento"
          value={clientData?.payment}
          fieldId="payment"
          readOnly={readOnly}
          onChange={onFieldUpdate}
        />
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
          <ClientUTMData 
            contactId={clientData.id} 
            readOnly={readOnly}
            onFieldUpdate={onFieldUpdate}
          />
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
            return (
              <EditableField
                key={field.id}
                label={field.name}
                value={value}
                fieldId={`custom_${field.id}`}
                readOnly={readOnly}
                onChange={onFieldUpdate}
              />
            );
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
            return (
              <EditableField
                key={field.id}
                label={field.name}
                value={value}
                fieldId={`custom_${field.id}`}
                readOnly={readOnly}
                onChange={onFieldUpdate}
              />
            );
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
