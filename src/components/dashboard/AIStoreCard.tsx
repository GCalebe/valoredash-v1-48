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
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIStoreCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/ai-store");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4" />
          Loja de IAs
        </CardTitle>
        <CardDescription className="text-indigo-100 text-xs">
          Inteligências artificiais
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
            <Bot className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
          Explore IAs pré-configuradas para diversas necessidades.
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-1">
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0">
            Marketing
          </Badge>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-1.5 py-0">
            Vendas
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-between py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 flex items-center gap-1 text-xs"
        >
          <Sparkles className="h-3 w-3" />
          Explorar
        </Badge>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/pricing");
          }}
          className="text-xs h-5 px-1.5"
        >
          Ver Planos
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIStoreCard;