import { toast } from "@/hooks/use-toast";
import { Contact } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";

export const useContactsActions = () => {
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
      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            name: newContact.name,
            email: newContact.email,
            phone: newContact.phone,
            address: newContact.address,
            client_name: newContact.clientName,
            client_size: newContact.clientSize,
            client_type: newContact.clientType,
            cpf_cnpj: newContact.cpfCnpj,
            asaas_customer_id: newContact.asaasCustomerId,
            status: "Active",
            notes: newContact.notes,
            tags: newContact.tags,
            responsible_user: newContact.responsibleUser,
            sales: newContact.sales,
            client_sector: newContact.clientSector,
            budget: newContact.budget,
            payment_method: newContact.paymentMethod,
            client_objective: newContact.clientObjective,
            loss_reason: newContact.lossReason,
            contract_number: newContact.contractNumber,
            contract_date: newContact.contractDate,
            payment: newContact.payment,
            uploaded_files: newContact.uploadedFiles,
            consultation_stage: newContact.consultationStage,
            kanban_stage: "Entraram",
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newContactId = data[0].id;
        onSuccess(newContactId);
        onContactReset();

        toast({
          title: "Cliente adicionado",
          description: `${newContact.name} foi adicionado com sucesso.`,
        });

        try {
          await fetch(
            "https://webhook.comercial247.com.br/webhook/cria_usuario",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newContact),
            },
          );
        } catch (webhookError) {
          console.error("Erro ao enviar para webhook:", webhookError);
        }
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível salvar o cliente no banco de dados.",
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
      const { error } = await supabase
        .from("contacts")
        .update({
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          address: newContact.address,
          client_name: newContact.clientName,
          client_size: newContact.clientSize,
          client_type: newContact.clientType,
          cpf_cnpj: newContact.cpfCnpj,
          asaas_customer_id: newContact.asaasCustomerId,
          status: newContact.status,
          notes: newContact.notes,
          tags: newContact.tags,
          responsible_user: newContact.responsibleUser,
          sales: newContact.sales,
          client_sector: newContact.clientSector,
          budget: newContact.budget,
          payment_method: newContact.paymentMethod,
          client_objective: newContact.clientObjective,
          loss_reason: newContact.lossReason,
          contract_number: newContact.contractNumber,
          contract_date: newContact.contractDate,
          payment: newContact.payment,
          uploaded_files: newContact.uploadedFiles,
          consultation_stage: newContact.consultationStage,
        })
        .eq("id", selectedContact.id);

      if (error) throw error;

      onSuccess();

      toast({
        title: "Cliente atualizado",
        description: `As informações de ${selectedContact.name} foram atualizadas.`,
      });

      try {
        await fetch(
          "https://webhook.comercial247.com.br/webhook/edita_usuario",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: selectedContact.id,
              ...newContact,
            }),
          },
        );
      } catch (webhookError) {
        console.error("Erro ao enviar para webhook:", webhookError);
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível atualizar o cliente no banco de dados.",
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
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", selectedContact.id);

      if (error) throw error;

      onSuccess();

      toast({
        title: "Cliente removido",
        description: `${selectedContact.name} foi removido da sua lista de clientes.`,
        variant: "destructive",
      });

      try {
        await fetch(
          "https://webhook.comercial247.com.br/webhook/exclui_usuario",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phone: selectedContact.phone }),
          },
        );
      } catch (webhookError) {
        console.error("Erro ao enviar para webhook:", webhookError);
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao remover cliente",
        description: "Não foi possível remover o cliente do banco de dados.",
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
