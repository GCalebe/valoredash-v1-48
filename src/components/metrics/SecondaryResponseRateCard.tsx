import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MessageCircleMore } from "lucide-react";

interface SecondaryResponseRateCardProps {
  value: number;
  totalRespondidas: number;
  totalSecondaryResponses: number;
  chartData?: Array<{ name: string; primary: number; secondary: number }>;
  loading?: boolean;
  showChart?: boolean;
}

const SecondaryResponseRateCard: React.FC<SecondaryResponseRateCardProps> = ({
  value,
  totalRespondidas,
  totalSecondaryResponses,
  chartData = [],
  loading = false,
  showChart = false,
}) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <MessageCircleMore className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Taxa de Resposta Secundária
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col space-y-4">
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            {showChart && (
              <div className="h-60 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4"></div>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {value}%
            </div>
            <div className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center">
              <MessageCircleMore className="h-3 w-3 mr-1" />
              <span>
                {totalSecondaryResponses} respostas secundárias de{" "}
                {totalRespondidas} conversas
              </span>
            </div>

            {showChart && chartData.length > 0 && (
              <div className="h-60 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.2}
                    />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="primary"
                      name="Primeira Resposta"
                      fill="#8B5CF6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="secondary"
                      name="Resposta Secundária"
                      fill="#6366F1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecondaryResponseRateCard;
