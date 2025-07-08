import { useState, useMemo } from "react";

export interface CustomFieldFilter {
  fieldId: string;
  fieldName: string;
  value: any;
}

export interface ClientsFilters {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  segmentFilter: string;
  setSegmentFilter: (v: string) => void;
  lastContactFilter: string;
  setLastContactFilter: (v: string) => void;
  customFieldFilters: CustomFieldFilter[];
  addCustomFieldFilter: (filter: CustomFieldFilter) => void;
  removeCustomFieldFilter: (fieldId: string) => void;
  hasActiveFilters: boolean;
  clearAll: (filterType?: "basic" | "customFields" | "all") => void;
}

export function useClientsFilters(): ClientsFilters {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [lastContactFilter, setLastContactFilter] = useState("all");
  const [customFieldFilters, setCustomFieldFilters] = useState<
    CustomFieldFilter[]
  >([]);

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
    hasActiveFilters,
    clearAll,
  };
}
