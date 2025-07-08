import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UTMGeoHeatmapProps {
  data: Array<{
    location: string;
    leads: number;
    conversions: number;
  }>;
  loading?: boolean;
}

const UTMGeoHeatmap: React.FC<UTMGeoHeatmapProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking por Região</CardTitle>
          <CardDescription>Regiões com mais leads e conversões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIntensityColor = (leads: number, maxLeads: number) => {
    const intensity = leads / maxLeads;
    if (intensity > 0.8) return "bg-red-500";
    if (intensity > 0.6) return "bg-orange-500";
    if (intensity > 0.4) return "bg-yellow-500";
    if (intensity > 0.2) return "bg-green-500";
    return "bg-blue-500";
  };

  const maxLeads = Math.max(...data.map((item) => item.leads), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌍 Ranking por Região</CardTitle>
        <CardDescription>Regiões com mais leads e conversões</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado geográfico disponível
            </div>
          ) : (
            data.map((region, index) => {
              const conversionRate =
                region.leads > 0
                  ? (region.conversions / region.leads) * 100
                  : 0;
              return (
                <div
                  key={region.location}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <div
                        className={`w-4 h-4 rounded ${getIntensityColor(
                          region.leads,
                          maxLeads,
                        )}`}
                        title={`Intensidade: ${Math.round(
                          (region.leads / maxLeads) * 100,
                        )}%`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{region.location}</h4>
                      <p className="text-sm text-gray-500">
                        {region.leads} leads • {region.conversions} conversões
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {conversionRate.toFixed(1)}% conv.
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UTMGeoHeatmap;
