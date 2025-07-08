import React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Clock,
  Mail,
  LinkIcon,
  LoaderCircle,
} from "lucide-react";
import { CalendarEvent } from "@/types/calendar";

interface EventsTableProps {
  events: CalendarEvent[];
  isLoading: boolean;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onOpenEventLink: (url: string) => void;
}

export const EventsTable = React.memo(function EventsTable({
  events,
  isLoading,
  onEditEvent,
  onDeleteEvent,
  onOpenEventLink,
}: EventsTableProps) {
  const getStatusColor = (status: string, responseStatus?: string) => {
    if (responseStatus) {
      switch (responseStatus) {
        case "accepted":
          return "bg-green-900/30 text-green-400";
        case "tentative":
          return "bg-yellow-900/30 text-yellow-400";
        case "declined":
          return "bg-red-900/30 text-red-400";
        case "needsAction":
          return "bg-blue-900/30 text-blue-400";
        default:
          return "bg-gray-900/30 text-gray-400";
      }
    }

    switch (status) {
      case "confirmed":
        return "bg-green-900/30 text-green-400";
      case "tentative":
        return "bg-yellow-900/30 text-yellow-400";
      case "cancelled":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-gray-900/30 text-gray-400";
    }
  };

  const getResponseStatusLabel = (responseStatus?: string) => {
    switch (responseStatus) {
      case "accepted":
        return "Confirmado";
      case "tentative":
        return "Provisório";
      case "declined":
        return "Recusado";
      case "needsAction":
        return "Pendente";
      default:
        return "Indefinido";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="text-white">
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-400">Horário</TableHead>
            <TableHead className="text-gray-400">Serviço</TableHead>
            <TableHead className="text-gray-400">Participante</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length > 0 ? (
            events.map((event) => {
              const start = parseISO(event.start);
              const end = parseISO(event.end);
              const attendee = event.attendees?.find((a) => a !== null);

              return (
                <TableRow key={event.id} className="border-gray-700">
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {format(start, "HH:mm")}
                      {!isSameDay(start, end) && " - evento de múltiplos dias"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(start, "dd/MM/yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{event.summary}</TableCell>
                  <TableCell>
                    {attendee?.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        {attendee.email}
                      </div>
                    ) : (
                      <span className="text-gray-500">Sem participante</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status,
                        attendee?.responseStatus,
                      )}`}
                    >
                      {getResponseStatusLabel(attendee?.responseStatus)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditEvent(event)}
                        title="Editar evento"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteEvent(event)}
                        title="Excluir evento"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenEventLink(event.htmlLink)}
                        title="Abrir no Google Calendar"
                        className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="border-gray-700">
              <TableCell
                colSpan={5}
                className="text-center py-4 text-gray-400"
              >
                {isLoading ? (
                  <div className="flex justify-center items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Carregando eventos...</span>
                  </div>
                ) : (
                  "Nenhum evento encontrado para esta data ou pesquisa."
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});