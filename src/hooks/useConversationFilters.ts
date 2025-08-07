import { useState, useMemo, useEffect } from "react";

export interface ConversationCustomFieldFilter {
  fieldId: string;
  fieldName: string;
  value: string | number | boolean | null;
}

export interface ConversationFilters {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  segmentFilter: string;
  setSegmentFilter: (v: string) => void;
  lastContactFilter: string;
  setLastContactFilter: (v: string) => void;
  // Conversation-specific filters
  unreadFilter: string;
  setUnreadFilter: (v: string) => void;
  lastMessageFilter: string;
  setLastMessageFilter: (v: string) => void;
  clientTypeFilter: string;
  setClientTypeFilter: (v: string) => void;
  customFieldFilters: ConversationCustomFieldFilter[];
  addCustomFieldFilter: (filter: ConversationCustomFieldFilter) => void;
  removeCustomFieldFilter: (fieldId: string) => void;
  hasActiveFilters: boolean;
  clearAll: (filterType?: "basic" | "customFields" | "all") => void;
}

export function useConversationFilters(): ConversationFilters {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [lastContactFilter, setLastContactFilter] = useState("all");
  
  // Conversation-specific filters
  const [unreadFilter, setUnreadFilter] = useState("all");
  const [lastMessageFilter, setLastMessageFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  
  const [customFieldFilters, setCustomFieldFilters] = useState<
    ConversationCustomFieldFilter[]
  >([]);

  // Suporte a filtros avançados via eventos (integrado ao modal)
  const createInitialFilter = () => ({ id: `group-${Date.now()}`, condition: 'AND', rules: [] });
  const [advancedFilter, setAdvancedFilter] = useState<any>(createInitialFilter());
  useEffect(() => {
    const apply = (e: any) => {
      const detail = e?.detail;
      if (detail && detail.id && Array.isArray(detail.rules)) {
        setAdvancedFilter(detail);
      }
    };
    const clear = () => setAdvancedFilter(createInitialFilter());
    window.addEventListener('conversations-apply-advanced-filter', apply as any);
    window.addEventListener('conversations-clear-advanced-filter', clear as any);
    return () => {
      window.removeEventListener('conversations-apply-advanced-filter', apply as any);
      window.removeEventListener('conversations-clear-advanced-filter', clear as any);
    };
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      segmentFilter !== "all" ||
      lastContactFilter !== "all" ||
      unreadFilter !== "all" ||
      lastMessageFilter !== "all" ||
      clientTypeFilter !== "all" ||
      searchTerm !== "" ||
      customFieldFilters.length > 0,
    [
      statusFilter,
      segmentFilter,
      lastContactFilter,
      unreadFilter,
      lastMessageFilter,
      clientTypeFilter,
      searchTerm,
      customFieldFilters,
    ],
  );

  const addCustomFieldFilter = (filter: ConversationCustomFieldFilter) => {
    setCustomFieldFilters((prev) => {
      // Replace if filter for this field already exists
      const exists = prev.some((f) => f.fieldId === filter.fieldId);
      if (exists) {
        return prev.map((f) => (f.fieldId === filter.fieldId ? filter : f));
      }
      // Otherwise add new filter
      return [...prev, filter];
    });
  };

  const removeCustomFieldFilter = (fieldId: string) => {
    setCustomFieldFilters((prev) => prev.filter((f) => f.fieldId !== fieldId));
  };

  const clearAll = (filterType: "basic" | "customFields" | "all" = "all") => {
    if (filterType === "all" || filterType === "basic") {
      setStatusFilter("all");
      setSegmentFilter("all");
      setLastContactFilter("all");
      setUnreadFilter("all");
      setLastMessageFilter("all");
      setClientTypeFilter("all");
      setSearchTerm("");
    }

    if (filterType === "all" || filterType === "customFields") {
      setCustomFieldFilters([]);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    segmentFilter,
    setSegmentFilter,
    lastContactFilter,
    setLastContactFilter,
    unreadFilter,
    setUnreadFilter,
    lastMessageFilter,
    setLastMessageFilter,
    clientTypeFilter,
    setClientTypeFilter,
    customFieldFilters,
    addCustomFieldFilter,
    removeCustomFieldFilter,
    hasActiveFilters,
    clearAll,
  };
}
