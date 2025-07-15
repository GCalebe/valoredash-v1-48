import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Receipt } from "lucide-react";
import type { Invoice } from "@/types/pricing";
import { formatDate } from "@/utils/formatters";

interface Props {
  invoices: Invoice[];
  onDownload: (id: string) => void;
}

const InvoicesTable: React.FC<Props> = ({ invoices, onDownload }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold">Histórico de Faturas</h3>
    {invoices.length > 0 ? (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map(invoice => (
              <TableRow key={invoice.id}>
                <TableCell>{formatDate(invoice.date || invoice.dueDate)}</TableCell>
                <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {invoice.status === "paid" ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Pago
                    </Badge>
                  ) : invoice.status === "open" ? (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Pendente
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      Atrasado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDownload(invoice.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ) : (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Receipt className="h-16 w-16 mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
          Nenhuma fatura encontrada
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Você ainda não possui faturas em seu histórico.
        </p>
      </div>
    )}
  </div>
);

export default InvoicesTable;
