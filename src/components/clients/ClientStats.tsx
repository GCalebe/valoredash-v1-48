import React from "react";
import ClientUTMData from "./ClientUTMData";
import EditableField from "./EditableField";
import CustomFieldRenderer from "./CustomFieldRenderer";
import { Contact } from "@/types/client";

interface ClientStatsProps {
  clientData: Contact | null;
  customFields: unknown[];
  consultationStageOptions: string[];
  fieldVisibility: Record<string, boolean>;
  onFieldUpdate?: (fieldId: string, newValue: any) => void;
  onVisibilityChange: (fieldId: string, visible: boolean) => void;
  readOnly: boolean;
  section: "commercial" | "utm";
}

const ClientStats: React.FC<ClientStatsProps> = ({
  clientData,
  customFields,
  consultationStageOptions,
  fieldVisibility,
  onFieldUpdate,
  onVisibilityChange,
  readOnly,
  section,
}) => {
  if (section === "utm") {
    return (
      <div className="space-y-4">
        {clientData?.id ? (
          <>
            <ClientUTMData
              contactId={clientData.id}
              readOnly={readOnly}
              onFieldUpdate={onFieldUpdate}
              onVisibilityChange={onVisibilityChange}
              showVisibilityControl={!readOnly}
            />
            {customFields
              .filter((field) => field.visibility_settings?.visible_in_tabs?.utm)
              .map((field) => (
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
  }

  return (
    <div className="space-y-4">
      <EditableField
        label="Status"
        value={clientData?.status}
        fieldId="status"
        type={readOnly ? "badge" : "select"}
        options={["Active", "Inactive"]}
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={onVisibilityChange}
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
        onVisibilityChange={onVisibilityChange}
        isVisible={fieldVisibility.consultationStage !== false}
        showVisibilityControl={!readOnly}
      />
      <EditableField
        label="Setor do Cliente"
        value={clientData?.clientSector}
        fieldId="clientSector"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={onVisibilityChange}
        isVisible={fieldVisibility.clientSector !== false}
        showVisibilityControl={!readOnly}
      />
      <EditableField
        label="Usuário Responsável"
        value={clientData?.responsibleUser}
        fieldId="responsibleUser"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={onVisibilityChange}
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
        onVisibilityChange={onVisibilityChange}
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
        onVisibilityChange={onVisibilityChange}
        isVisible={fieldVisibility.budget !== false}
        showVisibilityControl={!readOnly}
      />
      <EditableField
        label="Método de Pagamento"
        value={clientData?.paymentMethod}
        fieldId="paymentMethod"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={onVisibilityChange}
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
        onVisibilityChange={onVisibilityChange}
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
        onVisibilityChange={onVisibilityChange}
        isVisible={fieldVisibility.lossReason !== false}
        showVisibilityControl={!readOnly}
      />
      <EditableField
        label="Número de Contrato"
        value={clientData?.contractNumber}
        fieldId="contractNumber"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={onVisibilityChange}
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
        onVisibilityChange={onVisibilityChange}
        isVisible={fieldVisibility.contractDate !== false}
        showVisibilityControl={!readOnly}
      />
      <EditableField
        label="Pagamento"
        value={clientData?.payment}
        fieldId="payment"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={onVisibilityChange}
        isVisible={fieldVisibility.payment !== false}
        showVisibilityControl={!readOnly}
      />
      {customFields
        .filter((field) => field.visibility_settings?.visible_in_tabs?.commercial)
        .map((field) => (
          <CustomFieldRenderer
            key={field.id}
            field={field}
            value={clientData?.customValues?.[field.id]}
            onChange={(value) => onFieldUpdate?.(`custom_${field.id}`, value)}
          />
        ))}
    </div>
  );
};

export default ClientStats;
