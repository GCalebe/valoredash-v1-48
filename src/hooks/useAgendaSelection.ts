import { useState } from "react";

export function useAgendaSelection() {
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [selectedAgendaName, setSelectedAgendaName] = useState<string | null>(null);
  const [showAgendaSelection, setShowAgendaSelection] = useState(false);

  const handleAgendaSelect = (agendaId: string, agendaName: string) => {
    setSelectedAgendaId(agendaId);
    setSelectedAgendaName(agendaName);
  };

  const handleProceedWithAgenda = () => {
    if (selectedAgendaId) {
      setShowAgendaSelection(false);
      // This will be handled by the main schedule component now
      // setShowDateTimeSelection(true);
    }
  };

  const handleBackToAgendaSelection = () => {
    setShowAgendaSelection(true);
    setSelectedAgendaId(null);
    setSelectedAgendaName(null);
  };

  return {
    selectedAgendaId,
    selectedAgendaName,
    showAgendaSelection,
    setShowAgendaSelection,
    handleAgendaSelect,
    handleProceedWithAgenda,
    handleBackToAgendaSelection,
  };
}
