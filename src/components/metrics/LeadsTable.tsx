import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lead {
  id: number;
  name: string;
  lastContact: string;
  status: string;
}

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, loading = false }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "entraram":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "contato feito":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "conversa iniciada":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "reunião":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "proposta":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      case "fechamento":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Leads por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col space-y-3">
            <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Lead</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.lastContact}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(lead.status)} border-0`}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsTable;
