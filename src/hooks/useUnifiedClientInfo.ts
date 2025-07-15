import { useState, useRef } from "react";
import { useCustomFields } from "@/hooks/useCustomFields";

export function useUnifiedClientInfo(showTabs: string[]) {
  const [activeTab, setActiveTab] = useState(showTabs[0] || "basic");
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, boolean>>({});
  const { customFields } = useCustomFields();
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const consultationStageOptions = [
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
  ];

  const clientTypeOptions = [
    "Pessoa Física",
    "Pessoa Jurídica",
    "MEI",
    "Empresa",
  ];

  const clientSizeOptions = ["Pequeno", "Médio", "Grande"];

  return {
    activeTab,
    setActiveTab,
    fieldVisibility,
    setFieldVisibility,
    tabsScrollRef,
    customFields,
    consultationStageOptions,
    clientTypeOptions,
    clientSizeOptions,
  };
}
