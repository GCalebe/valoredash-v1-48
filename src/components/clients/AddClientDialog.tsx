// @ts-nocheck
import React, { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import AddClientCustomFields from "./AddClientCustomFields";
import { SkeletonCustomFields } from "@/components/ui/skeleton-form";
import { useOptimizedClientActions } from "@/hooks/useOptimizedClientActions";

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
  const { customFields, loading } = useCustomFields();
  
  const { createContactWithFields } = useOptimizedClientActions();
  
  const [saving, setSaving] = useState(false);
  
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
  const handleInputChange = (field: keyof Contact, value: any) => {
    baseHandleInputChange(field, value, newContact, setNewContact);
  };



  const handleSave = async () => {
    if (!validateForm(newContact)) {
      return;
    }

    setSaving(true);
    try {
      // Use optimized action that handles contact + custom fields in parallel
      await createContactWithFields(
        newContact,
        customValues,
        () => {
          // Success callback
          resetForm();
          setNewContact({
            name: "",
            email: "",
            phone: "",
            clientName: "",
            tags: [],
            notes: "",
            consultationStage: "Nova consulta",
          });
          setBasicCategories([]);
          setCommercialCategories([]);
          setDocumentsCategories([]);
          
          toast({
            title: "Cliente adicionado",
            description: "Cliente foi adicionado com sucesso ao sistema.",
          });
          
          onOpenChange(false);
        },
        () => {
          // Reset callback is handled in the action
        }
      );
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o cliente. Tente novamente.",
      });
    } finally {
      setSaving(false);
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            Adicionar Novo Cliente Comercial
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Preencha as informações para adicionar um novo cliente Comercial ao
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="principal">Principal</TabsTrigger>
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
            
            {/* Custom Fields Section */}
            <div className="mt-6">
              {loading ? (
                <SkeletonCustomFields />
              ) : (
                <AddClientCustomFields
                  customFields={customFields}
                  customValues={customValues}
                  onCustomFieldChange={handleCustomFieldChange}
                  loading={loading}
                />
              )}
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
            disabled={saving}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            onClick={handleSave}
            loading={saving}
            loadingText="Adicionando..."
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Adicionar Cliente
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
