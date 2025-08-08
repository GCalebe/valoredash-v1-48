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
import { useAppointmentForm } from "@/hooks/useAppointmentForm";
import { useScheduleDialogs } from "@/hooks/useScheduleDialogs";
import { useHosts } from "@/hooks/useHosts";
import { ScheduleContent } from "@/components/schedule/ScheduleContent";
import { ScheduleDialogs } from "@/components/schedule/ScheduleDialogs";
import { startOfMonth, endOfMonth } from "date-fns";
import { CalendarViewSwitcher } from "@/components/schedule/CalendarViewSwitcher";
import { NewAppointmentFlow } from "@/components/schedule/NewAppointmentFlow";
import ScheduleHeader from "./schedule/components/ScheduleHeader";

const Schedule = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings } = useThemeSettings();
  const { hosts, loading: isHostsLoading } = useHosts();
  const navigate = useNavigate();
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [hostFilter, setHostFilter] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isNewAppointmentFlowOpen, setIsNewAppointmentFlowOpen] = useState(false);

  const {
    selectedDate,
    setSelectedDate,
    appointments,
    setAppointments,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
  } = useScheduleState();

  const dialogs = useScheduleDialogs();

  const {
    formData,
    setFormData,
    handleSubmit,
  } = useAppointmentForm(appointments, setAppointments);

  const [calendarViewTab, setCalendarViewTab] = useState<
    "mes" | "semana" | "dia" | "agenda"
  >("mes");

  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
    isSubmitting,
    refreshEvents,
    addEvent,
    editEvent,
    deleteEvent,
  } = useCalendarEvents({ 
    currentMonth, 
    calendarViewType: calendarViewTab === "agenda" ? "lista" : calendarViewTab 
  });

  // Passar o hostFilter para o hook useScheduleData
  const {
    events: scheduleEvents,
    loading: isScheduleLoading,
    refreshing: isScheduleRefreshing,
    refetchScheduleData: refreshScheduleData,
  } = useScheduleData();

  const isAnyLoading = isEventsLoading || isScheduleLoading;
  const isAnyRefreshing = isSubmitting || isScheduleRefreshing;

  const handleRefreshAll = useCallback(() => {
    console.log("Atualizando todos os dados...");
    refreshEvents();
    refreshScheduleData();
  }, [refreshEvents, refreshScheduleData]);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const handleAddEvent = useCallback(
    (formData: EventFormData) => {
      addEvent(formData).then((success) => {
        if (success) {
          dialogs.setIsAddEventDialogOpen(false);
          setIsNewAppointmentFlowOpen(false);
        }
      });
    },
    [addEvent, dialogs],
  );

  const handleEditEvent = useCallback(
    (formData: EventFormData) => {
      if (dialogs.selectedEvent) {
        editEvent(dialogs.selectedEvent.id, formData).then((success) => {
          if (success) {
            dialogs.setIsEditEventDialogOpen(false);
            dialogs.setSelectedEvent(null);
          }
        });
      }
    },
    [dialogs, editEvent],
  );

  const handleDeleteEvent = useCallback(() => {
    if (dialogs.selectedEvent) {
      deleteEvent(dialogs.selectedEvent.id).then((success) => {
        if (success) {
          dialogs.setIsDeleteEventDialogOpen(false);
          dialogs.setSelectedEvent(null);
        }
      });
    }
  }, [dialogs, deleteEvent]);

  const openEditEventDialog = useCallback(
    (event: CalendarEvent) => {
      dialogs.setSelectedEvent(event);
      dialogs.setIsEditEventDialogOpen(true);
    },
    [dialogs],
  );

  const openDeleteEventDialog = useCallback(
    (event: CalendarEvent) => {
      dialogs.setSelectedEvent(event);
      dialogs.setIsDeleteEventDialogOpen(true);
    },
    [dialogs],
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
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isNewAppointmentFlowOpen) {
    return (
      <NewAppointmentFlow
        onBack={() => setIsNewAppointmentFlowOpen(false)}
        onFormSubmit={handleAddEvent}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <ScheduleHeader
        primaryColor={settings.primaryColor}
        onBack={() => navigate('/dashboard')}
        hosts={hosts}
        isHostsLoading={isHostsLoading}
        hostFilter={hostFilter}
        setHostFilter={setHostFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        calendarViewTab={calendarViewTab as 'mes' | 'semana' | 'dia' | 'agenda'}
        setCalendarViewTab={(view) => setCalendarViewTab(view)}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isAnyRefreshing}
        onOpenNew={() => setIsNewAppointmentFlowOpen(true)}
      />

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
          lastUpdated={null}
          setSearchTerm={setSearchTerm}
          setSelectedTab={setSelectedTab}
          setIsAddEventDialogOpen={dialogs.setIsAddEventDialogOpen}
          openEditEventDialog={openEditEventDialog}
          openDeleteEventDialog={openDeleteEventDialog}
          openEventLink={openEventLink}
          onMonthChange={handleMonthChange}
          calendarViewType={calendarViewTab === "agenda" ? "lista" : calendarViewTab}
          setCalendarViewType={(view) => setCalendarViewTab(view === "lista" ? "agenda" : view)}
          scheduleEvents={scheduleEvents}
          statusFilter={statusFilter}
          hostFilter={hostFilter}
        />
      </div>

      <ScheduleDialogs
        isAddEventDialogOpen={dialogs.isAddEventDialogOpen}
        setIsAddEventDialogOpen={dialogs.setIsAddEventDialogOpen}
        isEditEventDialogOpen={dialogs.isEditEventDialogOpen}
        setIsEditEventDialogOpen={dialogs.setIsEditEventDialogOpen}
        isDeleteEventDialogOpen={dialogs.isDeleteEventDialogOpen}
        setIsDeleteEventDialogOpen={dialogs.setIsDeleteEventDialogOpen}
        selectedEvent={dialogs.selectedEvent}
        isSubmitting={isSubmitting}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        appointments={appointments}
        isAddDialogOpen={dialogs.isAddDialogOpen}
        setIsAddDialogOpen={dialogs.setIsAddDialogOpen}
        isEditDialogOpen={dialogs.isEditDialogOpen}
        setIsEditDialogOpen={dialogs.setIsEditDialogOpen}
        isDeleteDialogOpen={dialogs.isDeleteDialogOpen}
        setIsDeleteDialogOpen={dialogs.setIsDeleteDialogOpen}
        currentAppointment={dialogs.currentAppointment}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={(e) => handleSubmit(e, dialogs.isEditDialogOpen, dialogs.currentAppointment, dialogs.setIsEditDialogOpen, dialogs.setIsAddDialogOpen)}
        confirmDelete={() => dialogs.confirmDelete(appointments, setAppointments)}
        error={eventsError?.message || null}
      />
    </div>
  );
};

export default Schedule;