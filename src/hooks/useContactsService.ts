import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/client";

export const useContactsService = () => {
  const fetchAllContacts = async (): Promise<Contact[]> => {
    try {
      // Since the view doesn't exist, we'll use the contacts table directly
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactsError) {
        throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
      }

      // Transform the data to match the Contact interface
      return (contactsData || []).map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        clientName: contact.client_name,
        clientSize: contact.client_size,
        clientType: contact.client_type,
        cpfCnpj: contact.cpf_cnpj,
        asaasCustomerId: contact.asaas_customer_id,
        status:
          contact.status === "Active" || contact.status === "Inactive"
            ? contact.status
            : "Active",
        notes: contact.notes,
        lastContact: contact.last_contact,
        lastMessage: contact.last_message,
        lastMessageTime: contact.last_message_time,
        unreadCount: contact.unread_count,
        sessionId: contact.session_id,
        tags: contact.tags || [],
        responsibleUser: contact.responsible_user,
        sales: contact.sales,
        clientSector: contact.client_sector,
        budget: contact.budget,
        paymentMethod: contact.payment_method,
        clientObjective: contact.client_objective,
        lossReason: contact.loss_reason,
        contractNumber: contact.contract_number,
        contractDate: contact.contract_date,
        payment: contact.payment,
        uploadedFiles: contact.uploaded_files || [],
        consultationStage:
          contact.consultation_stage &&
          [
            "Nova consulta",
            "Qualificado",
            "Chamada agendada",
            "Preparando proposta",
            "Proposta enviada",
            "Acompanhamento",
            "Negociação",
            "Fatura enviada",
            "Fatura paga – ganho",
            "Projeto cancelado – perdido",
          ].includes(contact.consultation_stage)
            ? (contact.consultation_stage as Contact["consultationStage"])
            : "Nova consulta",
        kanbanStage: contact.kanban_stage || "Entraram",
      }));
    } catch (error) {
      console.error("Error in fetchAllContacts:", error);
      throw error;
    }
  };

  const updateContactKanbanStage = async (
    contactId: string,
    stageTitle: string,
  ) => {
    try {
      // Update the contact with the stage directly
      const { error: updateError } = await supabase
        .from("contacts")
        .update({ kanban_stage: stageTitle })
        .eq("id", contactId);

      if (updateError) {
        throw new Error(`Failed to update contact: ${updateError.message}`);
      }
    } catch (error) {
      console.error("Error in updateContactKanbanStage:", error);
      throw error;
    }
  };

  return {
    fetchAllContacts,
    updateContactKanbanStage,
  };
};
