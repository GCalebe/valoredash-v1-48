import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useOptimizedCustomFields } from "@/hooks/useOptimizedCustomFields";
import CustomFieldRenderer from "./CustomFieldRenderer";

interface CustomFieldsSectionProps {
  contactId: string | null;
}

const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({ contactId }) => {
  const {
    customFieldsWithValues,
    isLoading,
    error,
    loadCustomFieldsForContact,
    saveCustomFields,
    retry,
  } = useOptimizedCustomFields();

  useEffect(() => {
    if (contactId) {
      loadCustomFieldsForContact(contactId);
    }
  }, [contactId, loadCustomFieldsForContact]);

  const handleFieldChange = async (fieldId: string, value: string | string[] | null) => {
    if (!contactId) return;

    await saveCustomFields(contactId, [
      { fieldId, value: value as string | number | boolean | null }
    ]);
  };

  const handleRetry = () => {
    if (contactId) {
      retry(contactId);
    }
  };

  if (!contactId) {
    return null;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-destructive" />
            Erro ao carregar campos personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && customFieldsWithValues.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Campos Personalizados
            <div className="w-3 h-3 border border-muted-foreground rounded-full border-t-transparent animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (customFieldsWithValues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Campos Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum campo personalizado configurado para este cliente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          Campos Personalizados
          {isLoading && (
            <div className="w-3 h-3 border border-muted-foreground rounded-full border-t-transparent animate-spin opacity-60" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customFieldsWithValues.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">
                {field.field_name}
                {field.is_required && <span className="text-destructive ml-1">*</span>}
              </label>
              <CustomFieldRenderer
                field={field}
                value={field.value}
                onChange={(value) => handleFieldChange(field.id, value as string | string[] | null)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomFieldsSection;