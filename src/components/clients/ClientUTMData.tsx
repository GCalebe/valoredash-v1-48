
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import EditableField from "./EditableField";

interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  device_type?: string;
  browser?: string;
  location?: string;
  referrer?: string;
}

interface ClientUTMDataProps {
  contactId: string;
  readOnly?: boolean;
  onFieldUpdate?: (fieldId: string, newValue: any) => void;
  onVisibilityChange?: (fieldId: string, visible: boolean) => void;
  showVisibilityControl?: boolean;
}

const ClientUTMData: React.FC<ClientUTMDataProps> = ({
  contactId,
  readOnly = true,
  onFieldUpdate,
  onVisibilityChange,
  showVisibilityControl = false,
}) => {
  const [utmData, setUtmData] = useState<UTMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUTMData = async () => {
      try {
        const { data, error } = await supabase
          .from("utm_tracking")
          .select("*")
          .eq("contact_id", contactId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Erro ao buscar dados UTM:", error);
          return;
        }

        if (data && data.length > 0) {
          setUtmData(data[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados UTM:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUTMData();
  }, [contactId]);

  const handleVisibilityChange = (fieldId: string, visible: boolean) => {
    setFieldVisibility(prev => ({
      ...prev,
      [fieldId]: visible
    }));
    
    if (onVisibilityChange) {
      onVisibilityChange(fieldId, visible);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-gray-500">Carregando dados UTM...</div>
      </div>
    );
  }

  if (!utmData) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Nenhum dado UTM encontrado para este cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <EditableField
        label="Fonte UTM"
        value={utmData.utm_source}
        fieldId="utm_source"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_source !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Meio UTM"
        value={utmData.utm_medium}
        fieldId="utm_medium"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_medium !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Campanha UTM"
        value={utmData.utm_campaign}
        fieldId="utm_campaign"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_campaign !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Termo UTM"
        value={utmData.utm_term}
        fieldId="utm_term"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_term !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Conteúdo UTM"
        value={utmData.utm_content}
        fieldId="utm_content"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_content !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Tipo de Dispositivo"
        value={utmData.device_type}
        fieldId="device_type"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.device_type !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Navegador"
        value={utmData.browser}
        fieldId="browser"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.browser !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Localização"
        value={utmData.location}
        fieldId="location"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.location !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="Referenciador"
        value={utmData.referrer}
        fieldId="referrer"
        readOnly={readOnly}
        onChange={onFieldUpdate}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.referrer !== false}
        showVisibilityControl={showVisibilityControl}
      />
    </div>
  );
};

export default ClientUTMData;
