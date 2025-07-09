import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClientsTableHeaderProps {
  visibleColumns: string[];
  onConfigureColumns: () => void;
}

export const ClientsTableHeader: React.FC<ClientsTableHeaderProps> = ({
  visibleColumns,
  onConfigureColumns,
}) => {
  return (
    <>
      <div className="flex justify-end p-2 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={onConfigureColumns}
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
          <span>Configurar Colunas</span>
        </Button>
      </div>

      <TableHeader>
        <TableRow>
          {/* Coluna de nome/cliente sempre visível */}
          <TableHead>Cliente</TableHead>

          {/* Colunas configuráveis */}
          {visibleColumns.includes("email") && <TableHead>Email</TableHead>}
          {visibleColumns.includes("clientName") && (
            <TableHead>Nome da Empresa</TableHead>
          )}
          {visibleColumns.includes("status") && <TableHead>Status</TableHead>}
          {visibleColumns.includes("kanbanStage") && (
            <TableHead>Estágio</TableHead>
          )}
          {visibleColumns.includes("lastMessage") && (
            <TableHead>Última Mensagem</TableHead>
          )}
          {visibleColumns.includes("tags") && <TableHead>Tags</TableHead>}
          {visibleColumns.includes("consultationStage") && (
            <TableHead>Consulta</TableHead>
          )}
          {visibleColumns.includes("budget") && (
            <TableHead>Orçamento</TableHead>
          )}
          {visibleColumns.includes("clientObjective") && (
            <TableHead>Objetivo</TableHead>
          )}
          {visibleColumns.includes("responsibleUser") && (
            <TableHead>Responsável</TableHead>
          )}

          {/* Coluna de ações sempre visível */}
          <TableHead className="w-[80px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
};