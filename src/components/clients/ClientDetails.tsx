import React from "react";
import EditableField from "./EditableField";
import CustomFieldRenderer from "./CustomFieldRenderer";
import { Contact } from "@/types/client";

interface ClientDetailsProps {
  clientData: Contact | null;
  customFields: unknown[];
  clientTypeOptions: string[];
  clientSizeOptions: string[];
  fieldVisibility: Record<string, boolean>;
  onFieldUpdate?: (fieldId: string, newValue: unknown) => void;
  onVisibilityChange: (fieldId: string, visible: boolean) => void;
  readOnly: boolean;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  clientData,
  customFields,
  clientTypeOptions,
  clientSizeOptions,
  fieldVisibility,
  onFieldUpdate,
  onVisibilityChange,
  readOnly,
}) => (
  <div className="space-y-4">
    <EditableField
      label="Nome"
      value={clientData?.name}
      fieldId="name"
      readOnly={readOnly}
      onChange={onFieldUpdate}
      onVisibilityChange={onVisibilityChange}
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
      onVisibilityChange={onVisibilityChange}
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
      onVisibilityChange={onVisibilityChange}
      isVisible={fieldVisibility.phone !== false}
      showVisibilityControl={!readOnly}
    />
    <EditableField
      label="Nome do Cliente"
      value={clientData?.clientName}
      fieldId="clientName"
      readOnly={readOnly}
      onChange={onFieldUpdate}
      onVisibilityChange={onVisibilityChange}
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
      onVisibilityChange={onVisibilityChange}
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
      onVisibilityChange={onVisibilityChange}
      isVisible={fieldVisibility.clientSize !== false}
      showVisibilityControl={!readOnly}
    />
    <EditableField
      label="CPF/CNPJ"
      value={clientData?.cpfCnpj}
      fieldId="cpfCnpj"
      readOnly={readOnly}
      onChange={onFieldUpdate}
      onVisibilityChange={onVisibilityChange}
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
      onVisibilityChange={onVisibilityChange}
      isVisible={fieldVisibility.address !== false}
      showVisibilityControl={!readOnly}
    />
    {customFields
      .filter((field) => field.visibility_settings?.visible_in_tabs?.basic)
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

export default ClientDetails;
