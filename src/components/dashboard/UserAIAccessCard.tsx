import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ShieldCheck } from "lucide-react";
import { useAIProductsQuery } from "@/hooks/useAIProductsQuery";
import { useUsers } from "@/hooks/useUsers";

const UserAIAccessCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users } = useUsers();
  const { data: aiProducts = [], isLoading } = useAIProductsQuery();

  // Use AI products from React Query
  const availableAIProducts = aiProducts;

  // Find the current user in our users list to get AI access
  const currentUser = users.find(u => u.email === user?.email);
  const accessibleAIs = currentUser?.ai_access || [];

  const handleClick = () => {
    navigate("/ai-store");
  };

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4" />
          Minhas IAs
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs">
          IAs disponíveis para você
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <Bot className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        
        {accessibleAIs.length > 0 ? (
          <div className="space-y-1 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
              Acesso a {accessibleAIs.length} IAs
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {accessibleAIs.slice(0, 2).map(aiId => {
                const ai = availableAIProducts.find(p => p.id === aiId);
                return (
                  <Badge 
                    key={aiId}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-1.5 py-0"
                  >
                    {ai ? ai.name : aiId}
                  </Badge>
                );
              })}
              {accessibleAIs.length > 2 && (
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-1.5 py-0">
                  +{accessibleAIs.length - 2}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
            Sem acesso a IAs
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-xs"
        >
          Ver minhas IAs
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default UserAIAccessCard;