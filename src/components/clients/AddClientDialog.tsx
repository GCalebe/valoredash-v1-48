import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import { Contact } from "@/types/client";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useAddClientFormLogic } from "@/hooks/useAddClientFormLogic";
import { DynamicCategory } from "./DynamicCategoryManager";
import TagsManager from "./TagsManager";
import ConsultationStageSelector from "./ConsultationStageSelector";
import { toast } from "@/hooks/use-toast";
import ValidationErrorAlert from "./ValidationErrorAlert";
import BasicInfoFields from "./BasicInfoFields";
import CompanyInfoFields from "./CompanyInfoFields";
import DialogTabsContent from "./DialogTabsContent";

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newContact: Partial<Contact>;
  setNewContact: (contact: Partial<Contact>) => void;
  handleAddContact: () => Promise<string | undefined>;
}

const AddClientDialog = ({
  isOpen,
  onOpenChange,
  newContact,
  setNewContact,
  handleAddContact,
}: AddClientDialogProps) => {
  const { customFields, fetchCustomFields, saveClientCustomValues } = useCustomFields();
  const [loading, setLoading] = useState(false);
  
  // Use custom hook for form logic
  const {
    validationErrors,
    activeTab,
    setActiveTab,
    customValues,
    handleInputChange: baseHandleInputChange,
    validateForm,
    resetForm,
    handleCustomFieldChange,
  } = useAddClientFormLogic();

  // State for dynamic categories per tab
  const [basicCategories, setBasicCategories] = useState<DynamicCategory[]>([]);
  const [commercialCategories, setCommercialCategories] = useState<DynamicCategory[]>([]);
  const [documentsCategories, setDocumentsCategories] = useState<DynamicCategory[]>([]);

  // Wrapper for input change to pass required parameters
  const handleInputChange = (field: keyof Contact, value: unknown) => {
    baseHandleInputChange(field, value, newContact, setNewContact);
  };

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      await fetchCustomFields();
      console.log("Custom fields loaded successfully");
    } catch (error) {
      console.error("Error loading custom fields:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCustomFields();
      console.log("AddClientDialog opened, loading custom fields");
    }
  }, [isOpen, fetchCustomFields]);

  const handleSave = async () => {
    if (!validateForm(newContact)) {
      return;
    }

    try {
      // Get newly created contact ID
      const newContactId = await handleAddContact();

      // Save custom field values if we have them and a contact ID
      if (newContactId && Object.keys(customValues).length > 0) {
        try {
          const customValuesArray = Object.entries(customValues).map(
            ([fieldId, value]) => ({ fieldId, value })
          );
          await saveClientCustomValues(newContactId, customValuesArray);
        } catch (customFieldError) {
          console.error("Error saving custom fields:", customFieldError);
        }
      }

      // Reset form and categories
      resetForm();
      setBasicCategories([]);
      setCommercialCategories([]);
      setDocumentsCategories([]);

      toast({
        title: "Cliente adicionado",
        description: "Cliente foi adicionado com sucesso ao sistema.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  console.log(
    "AddClientDialog render - isOpen:",
    isOpen,
    "activeTab:",
    activeTab,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 bg-green-500 hover:bg-green-600 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            Adicionar Novo Cliente Náutico
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Preencha as informações para adicionar um novo cliente náutico ao
            seu CRM.
          </DialogDescription>
        </DialogHeader>

        <ValidationErrorAlert errors={validationErrors} />

        {/* Tags Section */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            ADICIONAR TAGS
          </Label>
          <TagsManager
            tags={newContact.tags || []}
            onChange={(tags) => handleInputChange("tags", tags)}
          />
        </div>

        {/* Consultation Stage Section */}
        <div className="mb-6">
          <ConsultationStageSelector
            value={newContact.consultationStage || "Nova consulta"}
            onChange={(stage) => handleInputChange("consultationStage", stage)}
          />
        </div>

        <Tabs defaultValue="principal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="principal"
              onClick={() => setActiveTab("basico")}
            >
              Principal
            </TabsTrigger>
            <TabsTrigger value="utm">UTM</TabsTrigger>
            <TabsTrigger value="midia">Mídia</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="principal" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <BasicInfoFields 
                newContact={newContact}
                validationErrors={validationErrors}
                onInputChange={handleInputChange}
              />
              <CompanyInfoFields 
                newContact={newContact}
                validationErrors={validationErrors}
                onInputChange={handleInputChange}
              />
            </div>
          </TabsContent>

          <DialogTabsContent newContact={newContact} />
        </Tabs>

        <DialogFooter className="mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
            * Campos obrigatórios
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Adicionar Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
