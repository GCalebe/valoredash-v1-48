import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UTMData {
  id: string;
  lead_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  utm_created_at: string;
  utm_conversion: boolean;
  utm_conversion_value: number;
  utm_conversion_stage: string;
  landing_page: string;
  device_type: string;
}

interface UTMTrackingTableProps {
  data: UTMData[];
  loading?: boolean;
}

const UTMTrackingTable: React.FC<UTMTrackingTableProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rastreamento UTM Recente</CardTitle>
          <CardDescription>
            Últimas atividades de rastreamento de campanhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rastreamento UTM Recente</CardTitle>
        <CardDescription>
          Últimas atividades de rastreamento de campanhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Mídia</TableHead>
              <TableHead>Conversão</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Dispositivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  Nenhum dado de rastreamento UTM encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(new Date(item.utm_created_at), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-600"
                    >
                      {item.utm_source || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-600"
                    >
                      {item.utm_campaign || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-600"
                    >
                      {item.utm_medium || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.utm_conversion ? "default" : "secondary"}
                      className={
                        item.utm_conversion ? "bg-green-500 text-white" : ""
                      }
                    >
                      {item.utm_conversion ? "Converteu" : "Não converteu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.utm_conversion_value
                      ? `R$ ${item.utm_conversion_value.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-600"
                    >
                      {item.device_type || "Desktop"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UTMTrackingTable;
