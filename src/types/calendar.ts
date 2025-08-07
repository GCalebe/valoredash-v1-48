// Define event types based on the API response
export type CalendarAttendee = {
  email?: string;
  responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
};

export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  status: string;
  htmlLink: string;
  description?: string;
  attendees?: (CalendarAttendee | null)[];
  hostName?: string;
};

export type EventFormData = {
  summary: string;
  description: string;
  email: string;
  date: Date;
  startTime: string;
  endTime: string;
  hostName: string;
  automation?: string;
  colorId?: string;
  // New fields for improved data structure
  attendanceType?: string;
  employeeId?: string;
  productId?: string;
  serviceName?: string;
  tags?: any[];
  clientEmail?: string;
  clientPhone?: string;
  meetingLink?: string;
  location?: string;
};

// Appointment types (mock data)
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export type Appointment = {
  id: number;
  petName: string;
  ownerName: string;
  phone: string;
  date: Date;
  service: string;
  status: AppointmentStatus;
  notes: string;
};

export type AppointmentFormData = Omit<Appointment, "id">;

export interface ScheduleEvent {
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
