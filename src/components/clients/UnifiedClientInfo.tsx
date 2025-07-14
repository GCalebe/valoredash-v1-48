
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState(showTabs[0] || "basic");
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});
  const { customFields } = useCustomFields();
  const tabsScrollRef = useRef<HTMLDivElement>(null);

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

  const tabConfig = {
    basic: { label: "Básico", icon: "👤" },
    commercial: { label: "Comercial", icon: "💼" },
    utm: { label: "UTM", icon: "📊" },
    custom: { label: "Personalizado", icon: "⚙️" },
    docs: { label: "Arquivos", icon: "📁" }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = 150;
      const newScrollLeft = tabsScrollRef.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      tabsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleVisibilityChange = (fieldId: string, visible: boolean) => {
    setFieldVisibility(prev => ({
      ...prev,
      [fieldId]: visible
    }));
    
    console.log(`Campo ${fieldId} visibilidade alterada para: ${visible}`);
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
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
    </div>
  );

  const renderCommercialInfo = () => (
    <div className="space-y-4">
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
    </div>
  );

  const renderUTMData = () => (
    <div className="space-y-4">
      {clientData?.id ? (
        <>
          <ClientUTMData 
            contactId={clientData.id} 
            readOnly={readOnly}
            onFieldUpdate={onFieldUpdate}
            onVisibilityChange={handleVisibilityChange}
            showVisibilityControl={!readOnly}
          />
          
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
        </>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          Dados UTM não disponíveis para este cliente.
        </p>
      )}
    </div>
  );

  const renderCustomFields = () => (
    <div className="space-y-4">
      <CustomFieldsTab
        clientId={clientData?.id}
        onFieldUpdate={onFieldUpdate}
        readOnly={readOnly}
      />
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-4">
      <ClientFilesTab
        clientId={clientData?.id}
        onFileUpdate={(files) => {
          console.log('Arquivos atualizados:', files);
        }}
        readOnly={readOnly}
      />
      
      {customFields
        .filter(field => field.visibility_settings?.visible_in_tabs?.docs)
        .map(field => (
          <div key={field.id}>
            <CustomFieldRenderer
              field={field}
              value={clientData?.customValues?.[field.id]}
              onChange={(value) => onFieldUpdate?.(`custom_${field.id}`, value)}
            />
          </div>
        ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return renderBasicInfo();
      case "commercial":
        return renderCommercialInfo();
      case "utm":
        return renderUTMData();
      case "custom":
        return renderCustomFields();
      case "docs":
        return renderFiles();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Carousel Tab Navigation */}
      <div className="relative border-b border-border bg-background">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-0 z-10 h-full rounded-none shadow-md bg-background/80 backdrop-blur-sm"
          onClick={() => scrollTabs('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Scrollable tabs container */}
        <div
          ref={tabsScrollRef}
          className="flex overflow-x-auto scrollbar-hide mx-8 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-2 min-w-max">
            {showTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium 
                  transition-all duration-200 min-w-[120px]
                  ${activeTab === tab
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <span className="mr-2 text-base">
                  {tabConfig[tab as keyof typeof tabConfig]?.icon}
                </span>
                {tabConfig[tab as keyof typeof tabConfig]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 z-10 h-full rounded-none shadow-md bg-background/80 backdrop-blur-sm"
          onClick={() => scrollTabs('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Content with fixed height and scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedClientInfo;
