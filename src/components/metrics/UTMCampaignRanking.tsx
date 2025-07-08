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

interface UTMCampaignRankingProps {
  data: Array<{
    campaign: string;
    count: number;
    conversions: number;
    value: number;
    ctr: number;
    roas: number;
  }>;
  loading?: boolean;
}

const UTMCampaignRanking: React.FC<UTMCampaignRankingProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Campanhas</CardTitle>
          <CardDescription>Performance detalhada por campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getBadgeVariant = (value: number, type: "ctr" | "roas") => {
    if (type === "ctr") {
      if (value >= 5) return "default";
      if (value >= 2) return "secondary";
      return "destructive";
    } else {
      if (value >= 300) return "default";
      if (value >= 200) return "secondary";
      return "destructive";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Ranking de Campanhas</CardTitle>
        <CardDescription>
          Performance detalhada por campanha (CTR e ROAS)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead className="text-center">Leads</TableHead>
              <TableHead className="text-center">Conversões</TableHead>
              <TableHead className="text-center">CTR</TableHead>
              <TableHead className="text-center">Valor</TableHead>
              <TableHead className="text-center">ROAS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Nenhuma campanha encontrada
                </TableCell>
              </TableRow>
            ) : (
              data.map((campaign, index) => (
                <TableRow key={campaign.campaign}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{campaign.campaign}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.count}
                  </TableCell>
                  <TableCell className="text-center">
                    {campaign.conversions}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getBadgeVariant(campaign.ctr, "ctr")}>
                      {campaign.ctr.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(campaign.value)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getBadgeVariant(campaign.roas, "roas")}>
                      {campaign.roas.toFixed(0)}%
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

export default UTMCampaignRanking;
