import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Database } from "lucide-react";
import AddCustomFieldDialog from "./AddCustomFieldDialog";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useDynamicFields } from "@/hooks/useDynamicFields";

interface CustomFieldsDemoProps {
  contactId?: string;
}

const CustomFieldsDemo: React.FC<CustomFieldsDemoProps> = ({ contactId = "demo-contact" }) => {
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"basico" | "comercial" | "utm" | "midia">("basico");
  
  const { customFields, loading } = useCustomFields();
  const { dynamicFields, updateField } = useDynamicFields(contactId);

  const handleFieldAdded = () => {
    console.log("Campo adicionado com sucesso!");
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "single_select":
        return "bg-green-100 text-green-800";
      case "multi_select":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Texto Curto";
      case "single_select":
        return "Seleção Única";
      case "multi_select":
        return "Seleção Múltipla";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sistema de Campos Customizados
          </CardTitle>
          <CardDescription>
            Demonstração da funcionalidade de campos personalizados implementada.
            Os campos são armazenados no banco de dados e podem ser consultados posteriormente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Campos Disponíveis</h3>
            <Button 
              onClick={() => setAddFieldDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Campo
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando campos customizados...
            </div>
          ) : customFields.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum campo personalizado criado ainda.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setAddFieldDialogOpen(true)}
              >
                Criar Primeiro Campo
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {customFields.map((field) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{field.field_name}</h4>
                    <Badge className={getFieldTypeColor(field.field_type)}>
                      {getFieldTypeLabel(field.field_type)}
                    </Badge>
                  </div>
                  
                  {field.field_options && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Opções:</strong> {field.field_options.join(", ")}
                    </div>
                  )}
                  
                  {field.is_required && (
                    <Badge variant="destructive" className="mt-2">
                      Obrigatório
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Funcionalidades Implementadas:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Criação de campos de texto curto</li>
              <li>✅ Criação de campos de seleção única</li>
              <li>✅ Criação de campos de seleção múltipla</li>
              <li>✅ Armazenamento no banco de dados (tabelas custom_fields e client_custom_values)</li>
              <li>✅ Integração com as abas do painel de informações</li>
              <li>✅ Botões '+ Campo' funcionais em cada aba</li>
              <li>✅ Validação de campos obrigatórios</li>
              <li>✅ Interface responsiva e intuitiva</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AddCustomFieldDialog
        isOpen={addFieldDialogOpen}
        onClose={() => setAddFieldDialogOpen(false)}
        targetTab={selectedTab}
        onFieldAdded={handleFieldAdded}
      />
    </div>
  );
};

export default CustomFieldsDemo;