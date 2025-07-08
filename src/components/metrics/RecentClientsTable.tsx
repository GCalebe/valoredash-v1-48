import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  id: number;
  name: string;
  phone: string;
  marketingClients: number;
  lastVisit: string;
  status?: string;
}

interface RecentClientsTableProps {
  clients: Client[];
  loading?: boolean;
}

const RecentClientsTable: React.FC<RecentClientsTableProps> = ({
  clients,
  loading = false,
}) => {
  const navigate = useNavigate();

  const handleViewAllClients = () => {
    navigate("/clients");
  };

  const getStatusColor = (status?: string) => {
    if (!status)
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";

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
          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          Clientes Recentes
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            client.status,
                          )} border-0`}
                        >
                          {client.status || "Entraram"}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.lastVisit}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            className="text-sm flex items-center gap-2"
            onClick={handleViewAllClients}
          >
            Ver todos os clientes
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentClientsTable;
