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
import { Link } from "lucide-react";

const EvolutionCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/evolution");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Link className="h-4 w-4" />
          Whatsapp
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs">
          Conectar e sincronizar
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <Link className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
          Conecte seu sistema com seu Whatsapp Business.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-xs"
        >
          Conectar Whatsapp
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default EvolutionCard;