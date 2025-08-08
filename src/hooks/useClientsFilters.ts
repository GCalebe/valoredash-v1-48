import { useState, useMemo, useEffect, useRef } from "react";

export interface CustomFieldFilter {
  fieldId: string;
  fieldName: string;
  value: string | number | boolean | null;
}

export interface ClientsFilters {
  searchTerm: string;
  debouncedSearchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  segmentFilter: string;
  setSegmentFilter: (segment: string) => void;
  lastContactFilter: string;
  setLastContactFilter: (filter: string) => void;
  customFieldFilters: CustomFieldFilter[];
  addCustomFieldFilter: (filter: CustomFieldFilter) => void;
  removeCustomFieldFilter: (id: string) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export function useClientsFilters(): ClientsFilters {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [lastContactFilter, setLastContactFilter] = useState("all");
  const [customFieldFilters, setCustomFieldFilters] = useState<
    CustomFieldFilter[]
  >([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Implementa debounce para o searchTerm
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    const timeout = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    debounceTimeoutRef.current = timeout as unknown as NodeJS.Timeout;
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Cleanup do timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      statusFilter !== "all" ||
      segmentFilter !== "all" ||
      lastContactFilter !== "all" ||
      searchTerm !== "" ||
      customFieldFilters.length > 0,
    [
      statusFilter,
      segmentFilter,
      lastContactFilter,
      searchTerm,
      customFieldFilters,
    ],
  );

  const addCustomFieldFilter = (filter: CustomFieldFilter) => {
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
      setSearchTerm("");
    }

    if (filterType === "all" || filterType === "customFields") {
      setCustomFieldFilters([]);
    }
  };

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    segmentFilter,
    setSegmentFilter,
    lastContactFilter,
    setLastContactFilter,
    customFieldFilters,
    addCustomFieldFilter,
    removeCustomFieldFilter,
    clearAllFilters: clearAll,
    hasActiveFilters,
  };
}