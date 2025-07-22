import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CalendarInterface from "@/components/calendar/CalendarInterface";
import {
  useCalendarEvents,
  CalendarEvent,
  EventFormData,
} from "@/hooks/useCalendarEvents";
import { useScheduleData } from "@/hooks/useScheduleData";
import { useScheduleState } from "@/hooks/useScheduleState";
import { ScheduleContent } from "@/components/schedule/ScheduleContent";
import { ScheduleDialogs } from "@/components/schedule/ScheduleDialogs";
import { startOfMonth, endOfMonth } from "date-fns";
import { CalendarViewSwitcher } from "@/components/schedule/CalendarViewSwitcher";

const Schedule = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostFilter, setHostFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    // Agenda selection states
    selectedAgendaId,
    selectedAgendaName,
    showAgendaSelection,
    setShowAgendaSelection,
    handleAgendaSelect,
    handleProceedWithAgenda,
    handleBackToAgendaSelection,
    // DateTime selection states
    showDateTimeSelection,
    selectedAppointmentDate,
    selectedAppointmentTime,
    handleBackToAgendaFromDateTime,
    handleTimeSelect,
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
  } = useScheduleData();

  const isAnyLoading = isEventsLoading || isScheduleLoading;
  const isAnyRefreshing = isSubmitting || isScheduleRefreshing;

  const [calendarViewTab, setCalendarViewTab] = useState<
    "mes" | "semana" | "dia" | "agenda"
  >("mes");

  const handleRefreshAll = useCallback(async () => {
    console.log("Atualizando todos os dados...");
    setIsRefreshing(true);

    const refreshPromises = [refreshEventsPost(), refreshScheduleData()];

    try {
      await Promise.all(refreshPromises);
      console.log("Todos os dados atualizados com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setIsRefreshing(false);
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
    
    // Add overflow hidden to body when component is mounted
    document.body.style.overflow = "hidden";
    
    // Restore overflow when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <header
        className="text-white shadow-md transition-colors duration-300 rounded-b-xl flex-shrink-0"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="flex flex-row items-center justify-between h-16 w-full px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 focus-visible:ring-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Calendário</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Vendedor:</span>
              <select 
                value={hostFilter} 
                onChange={(e) => setHostFilter(e.target.value)}
                className="h-8 border-slate-600 text-white bg-slate-700/50 hover:bg-slate-600 text-xs rounded-md w-[120px] px-2"
              >
                <option value="all">Todos</option>
                <option value="corretor1">João Silva</option>
                <option value="corretor2">Maria Santos</option>
                <option value="corretor3">Pedro Costa</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Status:</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 border-slate-600 text-white bg-slate-700/50 hover:bg-slate-600 text-xs rounded-md w-[140px] px-2"
              >
                <option value="all">Todos</option>
                <option value="confirmado">Confirmados</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <CalendarViewSwitcher 
                view={calendarViewTab as "mes" | "semana" | "dia" | "agenda"} 
                onChange={(view) => setCalendarViewTab(view)} 
              />
            </div>
            
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="border-white text-white bg-transparent hover:bg-white/20 h-8 px-2"
            >
              <span className="flex items-center gap-1">
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Atualizando..." : "Atualizar"}
              </span>
            </Button>
            
            <Button 
              onClick={() => {
                setShowAgendaSelection(true);
                setSelectedAgendaId(null);
                setSelectedAgendaName(null);
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 h-8 px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-hidden">
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
          calendarViewType={calendarViewTab === "agenda" ? "lista" : calendarViewTab}
          setCalendarViewType={(view) => setCalendarViewTab(view === "lista" ? "agenda" : view)}
          scheduleEvents={scheduleEvents}
          statusFilter={statusFilter}
          hostFilter={hostFilter}
          showAgendaSelection={showAgendaSelection}
          selectedAgendaId={selectedAgendaId}
          selectedAgendaName={selectedAgendaName}
          onAgendaSelect={handleAgendaSelect}
          onProceedWithAgenda={handleProceedWithAgenda}
          onBackToAgendaSelection={handleBackToAgendaSelection}
          showDateTimeSelection={showDateTimeSelection}
          onBackToAgendaFromDateTime={handleBackToAgendaFromDateTime}
          onTimeSelect={handleTimeSelect}
        />
      </div>

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