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
import { MessageSquare, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Chats
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <CardDescription className="text-green-100">
          Conversas em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
            <MessageSquare className="h-14 w-14 text-green-500 dark:text-green-400" />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Carregando conversas...
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Conversas ativas:
              </span>
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300"
              >
                {conversations.length}
              </Badge>
            </div>

            {unreadCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Não lidas:
                </span>
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              </div>
            )}

            {conversations.length === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                Nenhuma conversa encontrada
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge
          variant="outline"
          className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50"
        >
          Acessar conversas
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ChatsCard;
