import React from "react";
import CustomFieldsTab from "./CustomFieldsTab";
import ClientFilesTab from "./ClientFilesTab";
import CustomFieldRenderer from "./CustomFieldRenderer";
import { Contact } from "@/types/client";

interface ClientActionsProps {
  clientData: Contact | null;
  customFields: any[];
  onFieldUpdate?: (fieldId: string, newValue: any) => void;
  readOnly: boolean;
  section: "custom" | "docs";
}

const ClientActions: React.FC<ClientActionsProps> = ({
  clientData,
  customFields,
  onFieldUpdate,
  readOnly,
  section,
}) => {
  if (section === "custom") {
    return (
      <div className="space-y-4">
        <CustomFieldsTab
          clientId={clientData?.id}
          onFieldUpdate={onFieldUpdate}
          readOnly={readOnly}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ClientFilesTab
        clientId={clientData?.id}
        onFileUpdate={(files) => {
          console.log('Arquivos atualizados:', files);
        }}
        readOnly={readOnly}
      />
      {customFields
        .filter((field) => field.visibility_settings?.visible_in_tabs?.docs)
        .map((field) => (
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
};

export default ClientActions;
