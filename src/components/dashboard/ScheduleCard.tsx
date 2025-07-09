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
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { useScheduleData } from "@/hooks/useScheduleData";
import { ScheduleEvent } from "@/types/calendar";

const ScheduleCard = () => {
  const navigate = useNavigate();
  const { events, loading, refreshing, refetchScheduleData } =
    useScheduleData();

  const handleClick = () => {
    navigate("/schedule");
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Schedule card refresh clicked");
    refetchScheduleData();
  };

  // Próximos agendamentos hoje
  const today = new Date();
  const todayEvents = events.filter((event: ScheduleEvent) => {
    const eventDate = new Date(event.date || event.start_time || '');
    return eventDate.toDateString() === today.toDateString();
  });

  console.log("ScheduleCard render:", {
    eventsCount: events.length,
    todayEventsCount: todayEvents.length,
    loading,
    refreshing,
  });

  return (
    <Card
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white h-full flex flex-col"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Agenda
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-white hover:bg-white/20 h-6 w-6 p-0"
          >
            <RefreshCw
              className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </CardTitle>
        <CardDescription className="text-blue-100 text-xs">
          Gerenciamento de agendamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
            Carregando...
          </p>
        ) : refreshing ? (
          <p className="text-gray-600 dark:text-gray-300 text-center text-xs">
            Atualizando...
          </p>
        ) : (
          <div className="space-y-1 text-center">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Hoje:
              </span>
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs"
              >
                {todayEvents.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Total:
              </span>
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs"
              >
                {events.length}
              </Badge>
            </div>
          </div>
        )}

        {todayEvents.length > 0 && !loading && !refreshing && (
          <div className="mt-1 pt-1 border-t dark:border-gray-700 w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Próximo hoje:
            </p>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium">{todayEvents[0].time || new Date(todayEvents[0].start_time || '').toLocaleTimeString()}</span>
              <span className="text-gray-600 dark:text-gray-300 truncate">
                - {todayEvents[0].clientName || todayEvents[0].client_name || 'Cliente'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 text-xs"
        >
          Acessar agenda
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ScheduleCard;