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

        {/* Coluna de ações com botão configurar colunas */}
        <TableHead className="w-[140px]">
          <div className="flex items-center justify-between">
            <span>Ações</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onConfigureColumns}
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Configurar Colunas"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};