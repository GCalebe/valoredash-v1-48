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
import { Users } from "lucide-react";

const ClientsCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/clients");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Clientes
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs">
          CRM e gerenciamento
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
            <Users className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
          Gerencie seus clientes e relacionamentos.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-xs"
        >
          Acessar CRM
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ClientsCard;