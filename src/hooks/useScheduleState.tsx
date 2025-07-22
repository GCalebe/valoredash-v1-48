import { useState } from "react";
import { Appointment } from "@/types/calendar";

export function useScheduleState() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("day");

  // DateTime selection states
  const [showDateTimeSelection, setShowDateTimeSelection] = useState(false);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState<Date | null>(null);
  const [selectedAppointmentTime, setSelectedAppointmentTime] = useState<string | null>(null);

  const handleTimeSelect = (date: Date, time: string, setIsAddEventDialogOpen: (isOpen: boolean) => void) => {
    setSelectedAppointmentDate(date);
    setSelectedAppointmentTime(time);
    setShowDateTimeSelection(false);
    setIsAddEventDialogOpen(true);
  };

  const handleBackToAgendaFromDateTime = (setShowAgendaSelection: (isOpen: boolean) => void) => {
    setShowDateTimeSelection(false);
    setShowAgendaSelection(true);
    setSelectedAppointmentDate(null);
    setSelectedAppointmentTime(null);
  };

  return {
    selectedDate,
    setSelectedDate,
    appointments,
    setAppointments,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
    showDateTimeSelection,
    setShowDateTimeSelection,
    selectedAppointmentDate,
    selectedAppointmentTime,
    handleTimeSelect,
    handleBackToAgendaFromDateTime,
  };
}
