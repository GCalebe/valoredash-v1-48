
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import EditableField from "./EditableField";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UTMData {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_type?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  landing_page?: string | null;
  ip_address?: string | null;
}

interface ClientUTMDataProps {
  contactId: string;
  readOnly?: boolean;
  onFieldUpdate?: (fieldId: string, newValue: string | number) => void;
  onVisibilityChange?: (fieldId: string, visible: boolean) => void;
  showVisibilityControl?: boolean;
}

const ClientUTMData: React.FC<ClientUTMDataProps> = ({
  contactId,
  readOnly = false,
  onFieldUpdate,
  onVisibilityChange,
  showVisibilityControl = false,
}) => {
  const [utmData, setUtmData] = useState<UTMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    fieldId: keyof UTMData | null;
    newValue: string | number | null;
    prevValue: string | number | null;
  }>({ fieldId: null, newValue: null, prevValue: null });
  const confirmTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchUTMData = async () => {
      if (!contactId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching UTM data for contact:", contactId);
        
        const { data, error } = await supabase
          .from("utm_tracking")
          .select("utm_source, utm_medium, utm_campaign, utm_term, utm_content, device_type, referrer, user_agent, landing_page, ip_address")
          .eq("lead_id", contactId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Erro ao buscar dados UTM:", error);
        }

        console.log("UTM data fetched:", data);

        if (data && data.length > 0) {
          setUtmData(data[0] as UTMData);
        } else {
          // Se não há dados UTM, mostrar campos vazios para permitir edição
          setUtmData({
            utm_source: null,
            utm_medium: null,
            utm_campaign: null,
            utm_term: null,
            utm_content: null,
            device_type: null,
            referrer: null,
            user_agent: null,
            landing_page: null,
            ip_address: null,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados UTM:", error);
        // Em caso de erro, ainda mostrar os campos vazios
        setUtmData({
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          utm_term: null,
          utm_content: null,
          device_type: null,
          referrer: null,
          user_agent: null,
          landing_page: null,
          ip_address: null,
        });
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

  const openConfirmSoon = () => {
    if (confirmTimeoutRef.current) {
      window.clearTimeout(confirmTimeoutRef.current);
    }
    confirmTimeoutRef.current = window.setTimeout(() => {
      setIsConfirmOpen(true);
    }, 500);
  };

  const handleFieldChange = (fieldId: string, newValue: string | number) => {
    const prev = (utmData as any)?.[fieldId] ?? null;
    setUtmData(prevState => ({ ...(prevState || {}), [fieldId]: newValue }));
    setPendingChange({ fieldId: fieldId as keyof UTMData, newValue, prevValue: prev });
    openConfirmSoon();
  };

  const confirmSave = async () => {
    if (!pendingChange.fieldId) {
      setIsConfirmOpen(false);
      return;
    }
    const fieldId = pendingChange.fieldId as string;
    const newValue = pendingChange.newValue as any;
    try {
      // Precisamos de user_id para o upsert multi-tenant
      const { data: auth } = await supabase.auth.getUser();
      const currentUserId = auth?.user?.id;
      const { error } = await supabase
        .from("utm_tracking")
        .upsert(
          {
            lead_id: contactId,
            user_id: currentUserId || null,
            [fieldId]: newValue,
            updated_at: new Date().toISOString(),
          },
          { onConflict: currentUserId ? "user_id,lead_id" : "lead_id" }
        );
      if (error) {
        console.error(`Erro ao salvar ${fieldId}:`, error);
      } else if (onFieldUpdate) {
        onFieldUpdate(fieldId, newValue);
      }
    } catch (error) {
      console.error(`Erro ao salvar ${fieldId}:`, error);
    } finally {
      setIsConfirmOpen(false);
      setPendingChange({ fieldId: null, newValue: null, prevValue: null });
    }
  };

  const cancelSave = () => {
    if (pendingChange.fieldId) {
      setUtmData(prev => ({ ...(prev || {}), [pendingChange.fieldId as string]: pendingChange.prevValue as any }));
    }
    setIsConfirmOpen(false);
    setPendingChange({ fieldId: null, newValue: null, prevValue: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-muted-foreground">Carregando dados UTM...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-full overflow-x-auto">
      <EditableField
        label="utm_source"
        value={utmData?.utm_source || ""}
        fieldId="utm_source"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_source !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="utm_medium"
        value={utmData?.utm_medium || ""}
        fieldId="utm_medium"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_medium !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="utm_campaign"
        value={utmData?.utm_campaign || ""}
        fieldId="utm_campaign"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_campaign !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="utm_term"
        value={utmData?.utm_term || ""}
        fieldId="utm_term"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_term !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="utm_content"
        value={utmData?.utm_content || ""}
        fieldId="utm_content"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.utm_content !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="device_type"
        value={utmData?.device_type || ""}
        fieldId="device_type"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.device_type !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="referrer"
        value={utmData?.referrer || ""}
        fieldId="referrer"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.referrer !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="user_agent"
        value={utmData?.user_agent || ""}
        fieldId="user_agent"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.user_agent !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="landing_page"
        value={utmData?.landing_page || ""}
        fieldId="landing_page"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.landing_page !== false}
        showVisibilityControl={showVisibilityControl}
      />
      <EditableField
        label="ip_address"
        value={utmData?.ip_address || ""}
        fieldId="ip_address"
        readOnly={readOnly}
        onChange={handleFieldChange}
        onVisibilityChange={handleVisibilityChange}
        isVisible={fieldVisibility.ip_address !== false}
        showVisibilityControl={showVisibilityControl}
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração?</AlertDialogTitle>
            <AlertDialogDescription>
              Salvar mudança em {pendingChange.fieldId ?? "campo"} para este contato?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSave}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientUTMData;
