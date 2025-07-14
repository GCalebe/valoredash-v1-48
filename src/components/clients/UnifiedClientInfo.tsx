import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/client";
import { DynamicCategory } from "@/components/clients/DynamicCategoryManager";
import ClientUTMData from "./ClientUTMData";
import EditableField from "./EditableField";
import CustomFieldsTab from "./CustomFieldsTab";
import ClientFilesTab from "./ClientFilesTab";
import { useCustomFields } from "@/hooks/useCustomFields";
import CustomFieldRenderer from "./CustomFieldRenderer";

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
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});
  const { customFields } = useCustomFields();

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

  const handleVisibilityChange = (fieldId: string, visible: boolean) => {
    setFieldVisibility(prev => ({
      ...prev,
      [fieldId]: visible
    }));
    
    // Aqui você pode implementar a lógica para salvar a configuração de visibilidade
    console.log(`Campo ${fieldId} visibilidade alterada para: ${visible}`);
  };

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
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.name !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Email"
          value={clientData?.email}
          fieldId="email"
          type="email"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.email !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Telefone"
          value={clientData?.phone}
          fieldId="phone"
          type="tel"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.phone !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Nome do Cliente"
          value={clientData?.clientName}
          fieldId="clientName"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.clientName !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Tipo de Cliente"
          value={clientData?.clientType}
          fieldId="clientType"
          type="select"
          options={clientTypeOptions}
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.clientType !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Tamanho do Cliente"
          value={clientData?.clientSize}
          fieldId="clientSize"
          type="select"
          options={clientSizeOptions}
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.clientSize !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="CPF/CNPJ"
          value={clientData?.cpfCnpj}
          fieldId="cpfCnpj"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.cpfCnpj !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Endereço"
          value={clientData?.address}
          fieldId="address"
          type="textarea"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.address !== false}
          showVisibilityControl={!readOnly}
        />
        
        {/* Campos personalizados da aba básica */}
        {customFields
          .filter(field => field.visibility_settings?.visible_in_tabs?.basic)
          .map(field => (
            <CustomFieldRenderer
              key={field.id}
              field={field}
              value={clientData?.customValues?.[field.id]}
              onChange={(value) => onFieldUpdate?.(`custom_${field.id}`, value)}
            />
          ))}
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
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.status !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Etapa da Consulta"
          value={clientData?.consultationStage}
          fieldId="consultationStage"
          type={readOnly ? "badge" : "select"}
          options={consultationStageOptions}
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.consultationStage !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Setor do Cliente"
          value={clientData?.clientSector}
          fieldId="clientSector"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.clientSector !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Usuário Responsável"
          value={clientData?.responsibleUser}
          fieldId="responsibleUser"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.responsibleUser !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Vendas"
          value={clientData?.sales}
          fieldId="sales"
          type="money"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.sales !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Orçamento"
          value={clientData?.budget}
          fieldId="budget"
          type="money"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.budget !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Método de Pagamento"
          value={clientData?.paymentMethod}
          fieldId="paymentMethod"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.paymentMethod !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Objetivo do Cliente"
          value={clientData?.clientObjective}
          fieldId="clientObjective"
          type="textarea"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.clientObjective !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Motivo de Perda"
          value={clientData?.lossReason}
          fieldId="lossReason"
          type="textarea"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.lossReason !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Número de Contrato"
          value={clientData?.contractNumber}
          fieldId="contractNumber"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.contractNumber !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Data de Contrato"
          value={clientData?.contractDate}
          fieldId="contractDate"
          type="text"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.contractDate !== false}
          showVisibilityControl={!readOnly}
        />
        <EditableField
          label="Pagamento"
          value={clientData?.payment}
          fieldId="payment"
          readOnly={readOnly}
          onChange={onFieldUpdate}
          onVisibilityChange={handleVisibilityChange}
          isVisible={fieldVisibility.payment !== false}
          showVisibilityControl={!readOnly}
        />
        
        {/* Campos personalizados da aba comercial */}
        {customFields
          .filter(field => field.visibility_settings?.visible_in_tabs?.commercial)
          .map(field => (
            <CustomFieldRenderer
              key={field.id}
              field={field}
              value={clientData?.customValues?.[field.id]}
              onChange={(value) => onFieldUpdate?.(`custom_${field.id}`, value)}
            />
          ))}
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
          <div className="space-y-2">
            <ClientUTMData 
              contactId={clientData.id} 
              readOnly={readOnly}
              onFieldUpdate={onFieldUpdate}
              onVisibilityChange={handleVisibilityChange}
              showVisibilityControl={!readOnly}
            />
            
            {/* Campos personalizados da aba UTM */}
            {customFields
              .filter(field => field.visibility_settings?.visible_in_tabs?.utm)
              .map(field => (
                <CustomFieldRenderer
                  key={field.id}
                  field={field}
                  value={clientData?.customValues?.[field.id]}
                  onChange={(value) => onFieldUpdate?.(`custom_${field.id}`, value)}
                />
              ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Dados UTM não disponíveis para este cliente.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderCustomFields = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg">Campos Personalizados</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CustomFieldsTab
          clientId={clientData?.id}
          onFieldUpdate={onFieldUpdate}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );

  const renderFiles = () => (
    <Card className={compact ? "p-3" : "p-4"}>
      <CardContent className="p-0">
        <ClientFilesTab
          clientId={clientData?.id}
          onFileUpdate={(files) => {
            // Callback para quando arquivos são atualizados
            console.log('Arquivos atualizados:', files);
          }}
          readOnly={readOnly}
        />
        
        {/* Campos personalizados da aba arquivos */}
        {customFields
          .filter(field => field.visibility_settings?.visible_in_tabs?.docs)
          .map(field => (
            <div key={field.id} className="mt-4">
              <CustomFieldRenderer
                field={field}
                value={clientData?.customValues?.[field.id]}
                onChange={(value) => onFieldUpdate?.(`custom_${field.id}`, value)}
              />
            </div>
          ))}
      </CardContent>
    </Card>
  );

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
            <TabsTrigger value="docs">Arquivos</TabsTrigger>
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
            {renderFiles()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UnifiedClientInfo;
