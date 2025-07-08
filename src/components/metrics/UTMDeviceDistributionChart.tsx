import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface UTMDeviceDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const UTMDeviceDistributionChart: React.FC<UTMDeviceDistributionChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads por Dispositivo</CardTitle>
          <CardDescription>
            Distribuição de leads por tipo de dispositivo
          </CardDescription>
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
        <CardTitle>Leads por Dispositivo</CardTitle>
        <CardDescription>
          Distribuição de leads por tipo de dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} leads`, "Leads"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UTMDeviceDistributionChart;
