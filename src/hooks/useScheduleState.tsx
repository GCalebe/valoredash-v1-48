import { useState } from "react";
import { Appointment } from "@/types/calendar";

export function useScheduleState() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("day");

  return {
    selectedDate,
    setSelectedDate,
    appointments,
    setAppointments,
    searchTerm,
    setSearchTerm,
    selectedTab,
    setSelectedTab,
  };
}
