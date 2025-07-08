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
import { Database } from "lucide-react";

const KnowledgeCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/knowledge");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Conhecimento
        </CardTitle>
        <CardDescription className="text-amber-100 text-xs">
          Documentos e arquivos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
            <Database className="h-8 w-8 text-amber-500 dark:text-amber-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
          Gerencie documentos e arquivos da base de conhecimento.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50 text-xs"
        >
          Acessar gerenciador
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default KnowledgeCard;