import { toast } from "@/hooks/use-toast";
import { Contact } from "@/types/client";
import { useAuth } from "@/context/AuthContext";
import { useCreateContactMutation, useUpdateContactMutation, useDeleteContactMutation } from "./useContactsQuery";

export const useContactsActions = () => {
  const { user } = useAuth();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();

  // Helper function to get contacts from localStorage
  const getContactsFromLocalStorage = (): Contact[] => {
    try {
      const userId = user?.id || 'anonymous';
      const storedContacts = localStorage.getItem(`contacts_${userId}`);
      if (storedContacts) {
        return JSON.parse(storedContacts);
      }
    } catch (error) {
      console.error("Error loading contacts from localStorage:", error);
    }
    return [];
  };

  // Helper function to save contacts to localStorage
  const saveContactsToLocalStorage = (contacts: Contact[]) => {
    try {
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`contacts_${userId}`, JSON.stringify(contacts));
    } catch (error) {
      console.error("Error saving contacts to localStorage:", error);
    }
  };

  const handleAddContact = async (
    newContact: Partial<Contact>,
    onSuccess: (contactId?: string) => void,
    onContactReset: () => void,
  ) => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Adding contact:", newContact);
      
      // Prepare contact data for Supabase
      const contactData = {
        name: newContact.name,
        email: newContact.email || null,
        phone: newContact.phone,
        address: newContact.address || null,
        client_name: newContact.clientName || null,
        client_size: newContact.clientSize || null,
        client_type: newContact.clientType || null,
        cpf_cnpj: newContact.cpfCnpj || null,
        asaas_customer_id: newContact.asaasCustomerId || null,
        status: "Active",
        notes: newContact.notes || null,
        last_contact: new Date().toISOString(),
        tags: newContact.tags || [],
        responsible_user: newContact.responsibleUser || null,
        sales: newContact.sales || null,
        client_sector: newContact.clientSector || null,
        budget: newContact.budget || null,
        payment_method: newContact.paymentMethod || null,
        client_objective: newContact.clientObjective || null,
        loss_reason: newContact.lossReason || null,
        contract_number: newContact.contractNumber || null,
        contract_date: newContact.contractDate || null,
        payment: newContact.payment || null,
        uploaded_files: newContact.uploadedFiles || null,
        consultation_stage: newContact.consultationStage || "Nova consulta",
        kanban_stage: "Entraram",
        session_id: `session_${Date.now()}`,
        user_id: user?.id || 'anonymous',
      };
      
      // Create contact using React Query mutation
      const createdContact = await createContactMutation.mutateAsync(contactData);
      
      console.log("Contact added successfully:", createdContact);
      
      toast({
        title: "Cliente adicionado",
        description: `${contactData.name} foi adicionado com sucesso.`,
      });
      
      // Call the success callback with the new contact ID
      onSuccess(createdContact?.id);
      
      // Reset the form
      onContactReset();
      
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível salvar o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async (
    selectedContact: Contact,
    newContact: Partial<Contact>,
    onSuccess: () => void,
  ) => {
    if (!selectedContact) return;

    try {
      console.log("Editing contact:", selectedContact.id, newContact);
      
      // Prepare update data for Supabase
      const updateData = {
        name: newContact.name || selectedContact.name,
        email: newContact.email || selectedContact.email,
        phone: newContact.phone || selectedContact.phone,
        address: newContact.address || selectedContact.address,
        client_name: newContact.clientName || selectedContact.clientName,
        client_size: newContact.clientSize || selectedContact.clientSize,
        client_type: newContact.clientType || selectedContact.clientType,
        cpf_cnpj: newContact.cpfCnpj || selectedContact.cpfCnpj,
        asaas_customer_id: newContact.asaasCustomerId || selectedContact.asaasCustomerId,
        status: newContact.status || selectedContact.status,
        notes: newContact.notes || selectedContact.notes,
        tags: newContact.tags || selectedContact.tags,
        responsible_user: newContact.responsibleUser || selectedContact.responsibleUser,
        sales: newContact.sales || selectedContact.sales,
        client_sector: newContact.clientSector || selectedContact.clientSector,
        budget: newContact.budget || selectedContact.budget,
        payment_method: newContact.paymentMethod || selectedContact.paymentMethod,
        client_objective: newContact.clientObjective || selectedContact.clientObjective,
        loss_reason: newContact.lossReason || selectedContact.lossReason,
        contract_number: newContact.contractNumber || selectedContact.contractNumber,
        contract_date: newContact.contractDate || selectedContact.contractDate,
        payment: newContact.payment || selectedContact.payment,
        uploaded_files: newContact.uploadedFiles || selectedContact.uploadedFiles,
        consultation_stage: newContact.consultationStage || selectedContact.consultationStage,
      };
      
      // Update contact using React Query mutation
      await updateContactMutation.mutateAsync({ id: selectedContact.id, ...updateData });
      
      // Call the success callback
      onSuccess();

      toast({
        title: "Cliente atualizado",
        description: `As informações de ${selectedContact.name} foram atualizadas.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível atualizar o cliente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (
    selectedContact: Contact,
    onSuccess: () => void,
  ) => {
    if (!selectedContact) return;

    try {
      console.log("Deleting contact:", selectedContact.id);
      
      // Delete contact using React Query mutation
      await deleteContactMutation.mutateAsync(selectedContact.id);
      
      // Call the success callback
      onSuccess();

      toast({
        title: "Cliente removido",
        description: `${selectedContact.name} foi removido da sua lista de clientes.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao remover cliente",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
  };
};