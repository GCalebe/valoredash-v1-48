import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Clock } from "lucide-react";

interface LeadsAverageByTimeData {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
}

interface LeadsAverageByTimeChartProps {
  data: LeadsAverageByTimeData[];
  loading?: boolean;
}

const LeadsAverageByTimeChart: React.FC<LeadsAverageByTimeChartProps> = ({
  data,
  loading = false,
}) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Média de Leads por Horário
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="day"
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="morning"
                  name="Manhã"
                  fill="#10B981"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="afternoon"
                  name="Tarde"
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="evening"
                  name="Noite"
                  fill="#8B5CF6"
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

export default LeadsAverageByTimeChart;
