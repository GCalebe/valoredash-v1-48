import { useMemo } from "react";
import { Contact } from "@/types/client";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";
import { isDateInPeriod } from "@/utils/dateUtils";

interface UseClientsTableFiltersProps {
  contacts: Contact[];
  searchTerm: string;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  customFieldFilters: CustomFieldFilter[];
}

export const useClientsTableFilters = ({
  contacts,
  searchTerm,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  customFieldFilters,
}: UseClientsTableFiltersProps) => {
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Filtro de busca por texto - expandido para incluir novos campos
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email &&
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.clientName &&
          contact.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.clientType &&
          contact.clientType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phone && contact.phone.includes(searchTerm)) ||
        (contact.responsibleHosts &&
          contact.responsibleHosts.some(host => 
            host.toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
        (contact.consultationStage &&
          contact.consultationStage.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de status - melhorado para considerar mais estados
      let matchesStatus = statusFilter === "all";
      
      if (statusFilter === "Ganhos") {
        matchesStatus = contact.consultationStage === "Fatura paga – ganho" ||
                       contact.status === "Ganhos";
      } else if (statusFilter === "Perdidos") {
        matchesStatus = contact.consultationStage === "Projeto cancelado – perdido" ||
                       contact.status === "Perdidos";
      } else if (statusFilter !== "all") {
        matchesStatus = contact.status === statusFilter;
      }

      // Filtro de segmento (kanban stage)
      const matchesSegment =
        segmentFilter === "all" || contact.kanbanStage === segmentFilter;

      // Filtro de último contato
      const matchesLastContact =
        lastContactFilter === "all" ||
        isDateInPeriod(contact.lastContact, lastContactFilter);

      // Filtro de campos personalizados
      const matchesCustomFields =
        customFieldFilters.length === 0 ||
        customFieldFilters.every((filter) => {
          if (!contact.customValues) return false;

          const customValue = contact.customValues[filter.fieldId];
          if (customValue === undefined) return false;

          if (
            typeof filter.value === "string" &&
            typeof customValue === "string"
          ) {
            return customValue.toLowerCase().includes(filter.value.toLowerCase());
          }

          if (typeof filter.value === "string" && !Array.isArray(customValue)) {
            return customValue === filter.value;
          }

          if (typeof filter.value === "string" && Array.isArray(customValue)) {
            return customValue.includes(filter.value);
          }

          return false;
        });

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSegment &&
        matchesLastContact &&
        matchesCustomFields
      );
    });
  }, [
    contacts,
    searchTerm,
    statusFilter,
    segmentFilter,
    lastContactFilter,
    customFieldFilters,
  ]);

  return { filteredContacts };
};