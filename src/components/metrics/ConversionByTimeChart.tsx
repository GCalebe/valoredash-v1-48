import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ConversionTimeData {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
}

interface ConversionByTimeChartProps {
  data: ConversionTimeData[];
  loading?: boolean;
}

const ConversionByTimeChart: React.FC<ConversionByTimeChartProps> = ({
  data,
  loading = false,
}) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          Conversões por Dia da Semana e Hora
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    border: "none",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="morning"
                  fill="#F59E0B"
                  name="Manhã (6h-12h)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="afternoon"
                  fill="#3B82F6"
                  name="Tarde (12h-18h)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="evening"
                  fill="#8B5CF6"
                  name="Noite (18h-24h)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionByTimeChart;
