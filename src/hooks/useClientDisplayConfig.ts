import { useState } from "react";

interface DisplayConfig {
  showTags: boolean;
  showConsultationStage: boolean;
  showCommercialInfo: boolean;
  showCustomFields: boolean;
  showResponsibleUser: boolean;
  columnPreferences: Array<{
    field: string;
    visible: boolean;
    order: number;
  }>;
}

export const useClientDisplayConfig = () => {
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
    showTags: true,
    showConsultationStage: true,
    showCommercialInfo: true,
    showCustomFields: true,
    showResponsibleUser: true,
    columnPreferences: [
      { field: "name", visible: true, order: 1 },
      { field: "phone", visible: true, order: 2 },
      { field: "email", visible: true, order: 3 },
      { field: "tags", visible: true, order: 4 },
      { field: "consultationStage", visible: true, order: 5 },
      { field: "clientName", visible: false, order: 6 },
      { field: "responsibleUser", visible: false, order: 7 },
      { field: "clientSector", visible: false, order: 8 },
      { field: "budget", visible: false, order: 9 },
    ],
  });

  const updateDisplayConfig = (newConfig: Partial<DisplayConfig>) => {
    setDisplayConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return {
    displayConfig,
    updateDisplayConfig,
  };
};
