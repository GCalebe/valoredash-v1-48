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

interface ScheduleEvent {
  id: string;
  title: string;
  date?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  clientName?: string;
  client_name?: string;
  description?: string;
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
}

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
      <CardHeader className="pb-2 bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Calendário
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
        <CardDescription className="text-teal-100 text-xs">
          Gerenciamento de agendamentos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 flex-grow flex flex-col items-center justify-center">
        <div className="mb-2 flex justify-center">
          <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-full">
            <Calendar className="h-8 w-8 text-teal-500 dark:text-teal-400" />
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
                className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 text-xs"
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
                className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 text-xs"
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
              <Clock className="h-3 w-3 text-teal-500 flex-shrink-0" />
              <span className="font-medium">
                {todayEvents[0].start_time ? new Date(todayEvents[0].start_time).toLocaleTimeString() : 'Sem horário'}
              </span>
              <span className="text-gray-600 dark:text-gray-300 truncate">
                - {todayEvents[0].title || 'Evento'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-2 mt-auto">
        <Badge
          variant="outline"
          className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/50 text-xs"
        >
          Acessar calendário
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ScheduleCard;