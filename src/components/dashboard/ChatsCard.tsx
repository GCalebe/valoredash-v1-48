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
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, RefreshCw } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";

const ChatsCard = () => {
  const navigate = useNavigate();
  const { conversations, loading, fetchConversations } = useConversations();

  const handleClick = () => {
    navigate("/chats");
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Chats card refresh clicked");
    fetchConversations();
  };

  // Calcular conversas não lidas
  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unread,
    0,
  );

  console.log("ChatsCard render:", {
    conversationsCount: conversations.length,
    unreadCount,
    loading,
  });

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Conversas
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white hover:bg-white/20 h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <CardDescription className="text-green-100 text-xs">
          Conversas em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <MessageSquare className="h-8 w-8 text-green-500 dark:text-green-400" />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
            Carregando...
          </p>
        ) : (
          <div className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {conversations.length} conversas ativas
              </span>
            </div>

            {unreadCount > 0 && (
              <div className="flex items-center justify-center">
                <Badge className="bg-red-500 text-white text-xs">
                  {unreadCount} não lidas
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50 text-xs"
        >
          Acessar conversas
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ChatsCard;