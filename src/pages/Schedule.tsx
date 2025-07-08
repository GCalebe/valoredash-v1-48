import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  useCalendarEvents,
  CalendarEvent,
  EventFormData,
} from "@/hooks/useCalendarEvents";
import { useScheduleData } from "@/hooks/useScheduleData";
import { useScheduleState } from "@/hooks/useScheduleState";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import { ScheduleContent } from "@/components/schedule/ScheduleContent";
import { ScheduleDialogs } from "@/components/schedule/ScheduleDialogs";
import { startOfMonth, endOfMonth } from "date-fns";

const Schedule = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostFilter, setHostFilter] = useState("all");

  const {
    selectedDate,
    setSelectedDate,
    appointments,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentAppointment,
    isAddEventDialogOpen,
    setIsAddEventDialogOpen,
    isEditEventDialogOpen,
    setIsEditEventDialogOpen,
    isDeleteEventDialogOpen,
    setIsDeleteEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    formData,
    setFormData,
    handleSubmit,
    confirmDelete,
  } = useScheduleState();

  // Estado para controlar o período de busca de eventos
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    () => {
      const currentMonth = selectedDate || new Date();
      return {
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      };
    },
  );

  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
    lastUpdated,
    refreshEventsPost,
    addEvent,
    editEvent,
    deleteEvent,
    isSubmitting,
  } = useCalendarEvents(selectedDate, dateRange);

  // Passar o hostFilter para o hook useScheduleData
  const {
    events: scheduleEvents,
    loading: isScheduleLoading,
    refreshing: isScheduleRefreshing,
    refetchScheduleData: refreshScheduleData,
  } = useScheduleData(hostFilter);

  const isAnyLoading = isEventsLoading || isScheduleLoading;
  const isAnyRefreshing = isSubmitting || isScheduleRefreshing;

  const [calendarViewTab, setCalendarViewTab] = React.useState<
    "mes" | "semana" | "dia" | "agenda"
  >("mes");

  const handleRefreshAll = useCallback(async () => {
    console.log("Atualizando todos os dados...");

    const refreshPromises = [refreshEventsPost(), refreshScheduleData()];

    try {
      await Promise.all(refreshPromises);
      console.log("Todos os dados atualizados com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  }, [refreshEventsPost, refreshScheduleData]);

  const handlePeriodChange = useCallback((start: Date, end: Date) => {
    console.log("Período alterado:", { start, end });
    setDateRange({ start, end });
  }, []);

  const handleAddEvent = useCallback(
    (formData: EventFormData) => {
      addEvent(formData).then((success) => {
        if (success) {
          setIsAddEventDialogOpen(false);
        }
      });
    },
    [addEvent, setIsAddEventDialogOpen],
  );

  const handleEditEvent = useCallback(
    (formData: EventFormData) => {
      if (selectedEvent) {
        editEvent(selectedEvent.id, formData).then((success) => {
          if (success) {
            setIsEditEventDialogOpen(false);
            setSelectedEvent(null);
          }
        });
      }
    },
    [selectedEvent, editEvent, setIsEditEventDialogOpen, setSelectedEvent],
  );

  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id).then((success) => {
        if (success) {
          setIsDeleteEventDialogOpen(false);
          setSelectedEvent(null);
        }
      });
    }
  }, [
    selectedEvent,
    deleteEvent,
    setIsDeleteEventDialogOpen,
    setSelectedEvent,
  ]);

  const openEditEventDialog = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      setIsEditEventDialogOpen(true);
    },
    [setSelectedEvent, setIsEditEventDialogOpen],
  );

  const openDeleteEventDialog = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      setIsDeleteEventDialogOpen(true);
    },
    [setSelectedEvent, setIsDeleteEventDialogOpen],
  );

  const openEventLink = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate("/");
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ScheduleHeader
        onAddEvent={() => setIsAddEventDialogOpen(true)}
        onRefresh={handleRefreshAll}
        isRefreshing={isAnyRefreshing}
        lastUpdated={lastUpdated}
        view={calendarViewTab}
        onViewChange={setCalendarViewTab}
        onOpenFilter={() => {}}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        hostFilter={hostFilter}
        onHostFilterChange={setHostFilter}
      />

      <ScheduleContent
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        events={events}
        appointments={appointments}
        selectedTab={selectedTab}
        searchTerm={searchTerm}
        isAnyLoading={isAnyLoading}
        eventsError={eventsError}
        lastUpdated={lastUpdated}
        setSearchTerm={setSearchTerm}
        setSelectedTab={setSelectedTab}
        setIsAddEventDialogOpen={setIsAddEventDialogOpen}
        openEditEventDialog={openEditEventDialog}
        openDeleteEventDialog={openDeleteEventDialog}
        openEventLink={openEventLink}
        onPeriodChange={handlePeriodChange}
        calendarViewType={calendarViewTab}
        setCalendarViewType={setCalendarViewTab}
        scheduleEvents={scheduleEvents}
        statusFilter={statusFilter}
        hostFilter={hostFilter}
      />

      <ScheduleDialogs
        isAddEventDialogOpen={isAddEventDialogOpen}
        setIsAddEventDialogOpen={setIsAddEventDialogOpen}
        isEditEventDialogOpen={isEditEventDialogOpen}
        setIsEditEventDialogOpen={setIsEditEventDialogOpen}
        isDeleteEventDialogOpen={isDeleteEventDialogOpen}
        setIsDeleteEventDialogOpen={setIsDeleteEventDialogOpen}
        selectedEvent={selectedEvent}
        isSubmitting={isSubmitting}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        appointments={appointments}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        currentAppointment={currentAppointment}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default Schedule;
