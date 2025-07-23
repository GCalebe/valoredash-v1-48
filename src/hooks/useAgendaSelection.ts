import { useState } from "react";

export function useAgendaSelection() {
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [selectedAgendaName, setSelectedAgendaName] = useState<string | null>(null);

  const handleAgendaSelect = (agendaId: string, agendaName: string) => {
    setSelectedAgendaId(agendaId);
    setSelectedAgendaName(agendaName);
  };

  const handleBackToAgendaSelection = () => {
    setSelectedAgendaId(null);
    setSelectedAgendaName(null);
  };

  return {
    selectedAgendaId,
    selectedAgendaName,
    handleAgendaSelect,
    handleBackToAgendaSelection,
  };
}
