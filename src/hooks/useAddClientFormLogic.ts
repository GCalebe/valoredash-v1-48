import { useState, useCallback } from 'react';
import { Contact } from "@/types/client";
import { validateClientForm } from "@/components/clients/ClientFormValidation";
import { toast } from "@/hooks/use-toast";

export const useAddClientFormLogic = () => {
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("basico");
  const [customValues, setCustomValues] = useState<{ [fieldId: string]: unknown }>({});

  const handleInputChange = useCallback((
    field: keyof Contact,
    value: unknown,
    newContact: Partial<Contact>,
    setNewContact: (contact: Partial<Contact>) => void
  ) => {
    setNewContact({ ...newContact, [field]: value });

    // Clear field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateForm = useCallback((newContact: Partial<Contact>) => {
    const validation = validateClientForm(newContact);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);

      // Navigate to first tab with error
      if (validation.errors.name || validation.errors.phone || validation.errors.email) {
        setActiveTab("basico");
      } else if (validation.errors.budget || validation.errors.cpfCnpj) {
        setActiveTab("comercial");
      }

      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros destacados no formulário.",
        variant: "destructive",
      });

      return false;
    }

    return true;
  }, []);

  const resetForm = useCallback(() => {
    setCustomValues({});
    setValidationErrors({});
    setActiveTab("basico");
  }, []);

  const handleCustomFieldChange = useCallback((fieldId: string, value: any) => {
    setCustomValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  return {
    validationErrors,
    activeTab,
    setActiveTab,
    customValues,
    handleInputChange,
    validateForm,
    resetForm,
    handleCustomFieldChange,
  };
};