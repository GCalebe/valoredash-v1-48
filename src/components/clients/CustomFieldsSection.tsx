import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useOptimizedCustomFields } from "@/hooks/useOptimizedCustomFields";
import { useCustomFields } from "@/hooks/useCustomFields";
import CustomFieldRenderer from "./CustomFieldRenderer";
import { CustomField, CustomFieldWithValue } from "@/types/customFields";
import { Loader2 } from "lucide-react";

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
  
  const { customFields, loading: fieldsLoading, fetchCustomFields } = useCustomFields();
  const [customValues, setCustomValues] = useState<{ [fieldId: string]: string | string[] | null }>({});

  // Carregar todos os campos personalizados disponíveis - apenas uma vez
  useEffect(() => {
    fetchCustomFields();
  }, [fetchCustomFields]);

  // Carregar valores dos campos personalizados para o cliente específico - apenas quando contactId mudar
  useEffect(() => {
    if (contactId) {
      loadCustomFieldsForContact(contactId);
    }
  }, [contactId, loadCustomFieldsForContact]);
  
  // Pré-carregar campos personalizados para contatos que possam ser selecionados em breve
  useEffect(() => {
    // Se temos um contactId atual, podemos pré-carregar outros contatos relacionados
    // Esta é uma otimização que pode ser expandida conforme necessário
    if (contactId && customFields.length > 0) {
      // Aqui poderíamos implementar lógica para pré-carregar contatos relacionados
      // Por exemplo, contatos da mesma empresa ou grupo
    }
  }, [contactId, customFields]);

  // Atualizar customValues quando customFieldsWithValues mudar - com verificação para evitar loops
  useEffect(() => {
    if (customFieldsWithValues.length > 0) {
      // Criar um novo objeto de valores para comparação
      const newValuesMap = customFieldsWithValues.reduce((acc, field) => {
        acc[field.id] = field.value;
        return acc;
      }, {} as { [fieldId: string]: string | string[] | null });
      
      // Usar uma função de atualização de estado para comparar com o estado anterior
      // Isso evita a necessidade de incluir customValues como dependência
      setCustomValues(prevValues => {
        // Verificar se os valores realmente mudaram antes de atualizar o estado
        const hasChanged = Object.keys(newValuesMap).some(key => 
          newValuesMap[key] !== prevValues[key]
        );
        
        // Se mudou, retorna o novo mapa, senão mantém o estado anterior
        return hasChanged ? newValuesMap : prevValues;
      });
    }
  }, [customFieldsWithValues]);


  const handleFieldChange = async (fieldId: string, value: string | string[] | null) => {
    if (!contactId) return;

    // Atualizar o estado local imediatamente para feedback instantâneo ao usuário
    // Mas apenas se o valor realmente mudou
    if (customValues[fieldId] !== value) {
      setCustomValues(prev => ({
        ...prev,
        [fieldId]: value
      }));

      // Salvar no servidor apenas se o valor mudou
      await saveCustomFields(contactId, [
        { fieldId, value: value as string | number | boolean | null }
      ]);
    }
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

  // Mostrar esqueleto de carregamento apenas se não tivermos nenhum campo disponível
  // e estamos carregando os campos (não os valores)
  if (fieldsLoading && customFields.length === 0) {
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
            <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              CAMPOS PERSONALIZADOS
            </Label>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar campos que devem ser visíveis na aba básica, como na tela de criação
  const visibleFields = customFields.filter(field => 
    field.visibility_settings?.visible_in_tabs?.basic !== false
  );

  // Combinar os campos visíveis com seus valores - evitando duplicação
  // Usamos um Map para garantir que cada campo apareça apenas uma vez
  const fieldsMap = new Map();
  
  // Primeiro adicionar todos os campos visíveis ao map
  visibleFields.forEach(field => {
    if (!fieldsMap.has(field.id)) {
      fieldsMap.set(field.id, {
        ...field,
        value: customValues[field.id] || null,
        // Marcar campos que estão com valores carregando
        isValueLoading: isLoading && !customValues[field.id] && customFieldsWithValues.length === 0
      });
    }
  });
  
  // Converter o Map para array para renderização
  const fieldsToRender = Array.from(fieldsMap.values());

  if (visibleFields.length === 0) {
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
          {isLoading && customFieldsWithValues.length === 0 && (
            <div className="w-3 h-3 border border-muted-foreground rounded-full border-t-transparent animate-spin opacity-60" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fieldsToRender.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.isValueLoading ? (
                <div>
                  <Label className="text-sm font-medium mb-2">{field.field_name}</Label>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <CustomFieldRenderer
                  field={field}
                  value={customValues[field.id] || field.value}
                  onChange={(value) => handleFieldChange(field.id, value as string | string[] | null)}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomFieldsSection;