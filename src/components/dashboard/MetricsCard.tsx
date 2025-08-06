import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "lucide-react";

const MetricsCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/metrics");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <LineChart className="h-4 w-4" />
          Métricas
        </CardTitle>
        <CardDescription className="text-purple-100 text-xs">
          Estatísticas e indicadores
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full relative">
            <LineChart className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              110
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center">
            <LineChart className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1" />
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
              Análise de indicadores
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/50 text-xs"
        >
          Acessar dashboard
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default MetricsCard;