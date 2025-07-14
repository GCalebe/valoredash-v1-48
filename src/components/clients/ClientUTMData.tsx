
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import EditableField from "./EditableField";

interface UTMData {
  id: string;
  lead_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_created_at?: string;
  created_at: string;
  utm_conversion?: boolean;
  utm_conversion_value?: number;
  utm_conversion_stage?: string;
  landing_page?: string;
  device_type?: string;
  geo_location?: any;
  utm_first_touch?: string;
  utm_last_touch?: string;
  [key: string]: any;
}

interface ClientUTMDataProps {
  contactId: string;
  readOnly?: boolean;
  onFieldUpdate?: (fieldId: string, newValue: any) => void;
}

const ClientUTMData: React.FC<ClientUTMDataProps> = ({ 
  contactId, 
  readOnly = true, 
  onFieldUpdate 
}) => {
  const [utmData, setUtmData] = useState<UTMData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUTMData = async () => {
      try {
        setLoading(true);

        // Buscar dados UTM relacionados ao cliente (pegar o mais recente)
        const { data, error } = await supabase
          .from("utm_tracking")
          .select("*")
          .eq("lead_id", contactId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar dados UTM:", error);
          return;
        }

        setUtmData(data || null);
      } catch (error) {
        console.error("Erro ao processar dados UTM:", error);
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchUTMData();
    }
  }, [contactId]);

  const handleFieldChange = (fieldId: string, newValue: any) => {
    if (onFieldUpdate) {
      onFieldUpdate(`utm_${fieldId}`, newValue);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const deviceTypeOptions = [
    "Desktop",
    "Mobile",
    "Tablet",
    "Desconhecido"
  ];

  const conversionStageOptions = [
    "Visitante",
    "Lead",
    "MQL",
    "SQL",
    "Oportunidade",
    "Cliente"
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="UTM Source"
          value={utmData?.utm_source}
          fieldId="source"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="UTM Medium"
          value={utmData?.utm_medium}
          fieldId="medium"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="UTM Campaign"
          value={utmData?.utm_campaign}
          fieldId="campaign"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="UTM Term"
          value={utmData?.utm_term}
          fieldId="term"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="UTM Content"
          value={utmData?.utm_content}
          fieldId="content"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="Landing Page"
          value={utmData?.landing_page}
          fieldId="landing_page"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="Tipo de Dispositivo"
          value={utmData?.device_type}
          fieldId="device_type"
          type={readOnly ? "text" : "select"}
          options={deviceTypeOptions}
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="Estágio de Conversão"
          value={utmData?.utm_conversion_stage}
          fieldId="conversion_stage"
          type={readOnly ? "text" : "select"}
          options={conversionStageOptions}
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Valor de Conversão"
          value={utmData?.utm_conversion_value}
          fieldId="conversion_value"
          type="money"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="Primeiro Toque"
          value={utmData?.utm_first_touch}
          fieldId="first_touch"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
        
        <EditableField
          label="Último Toque"
          value={utmData?.utm_last_touch}
          fieldId="last_touch"
          readOnly={readOnly}
          onChange={handleFieldChange}
        />
      </div>

      {utmData?.geo_location && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Localização Geográfica
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {typeof utmData.geo_location === 'string' ? 
              utmData.geo_location : 
              JSON.stringify(utmData.geo_location)
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientUTMData;
