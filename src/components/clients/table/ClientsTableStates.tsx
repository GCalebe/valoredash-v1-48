import React from "react";

interface ClientsTableStatesProps {
  isLoading: boolean;
  hasContacts: boolean;
  hasFilters: boolean;
  searchTerm: string;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
}

export const ClientsTableStates: React.FC<ClientsTableStatesProps> = ({
  isLoading,
  hasContacts,
  hasFilters,
  searchTerm,
  statusFilter,
  segmentFilter,
  lastContactFilter,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (!hasContacts) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {hasFilters
            ? "Nenhum cliente encontrado com os filtros aplicados."
            : "Nenhum cliente disponível. Adicione seu primeiro cliente!"}
        </p>
      </div>
    );
  }

  return null;
};