import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ConversationData {
  date: string;
  respondidas: number;
  naoRespondidas: number;
}

interface ConversationChartProps {
  data: ConversationData[];
  loading?: boolean;
}

const ConversationChart: React.FC<ConversationChartProps> = ({
  data,
  loading = false,
}) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Conversas Respondidas x Não Respondidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="date"
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
                <Line
                  type="monotone"
                  dataKey="respondidas"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Respondidas"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="naoRespondidas"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Não Respondidas"
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationChart;
