import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface UTMCampaignChartProps {
  data: Array<{
    name: string;
    leads: number;
    conversions: number;
    value: number;
  }>;
  loading?: boolean;
}

const UTMCampaignChart: React.FC<UTMCampaignChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance por Campanha</CardTitle>
          <CardDescription>Leads e conversões por campanha UTM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Campanha</CardTitle>
        <CardDescription>Leads e conversões por campanha UTM</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                name === "value" ? `R$ ${value}` : value,
                name === "leads"
                  ? "Leads"
                  : name === "conversions"
                    ? "Conversões"
                    : "Valor",
              ]}
            />
            <Legend />
            <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
            <Bar dataKey="conversions" fill="#10b981" name="Conversões" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UTMCampaignChart;
