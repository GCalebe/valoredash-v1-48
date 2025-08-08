export type AgendaCategory = 'consulta' | 'evento' | 'classes' | 'recorrente' | '';

export type Reminder = {
  id: number;
  when: string;
  subject: string;
  sendTo: 'inscrito' | 'anfitriao';
  channel: 'email' | 'sms';
};

export type LocalAgenda = {
  id: string;
  title: string;
  description: string;
  category: AgendaCategory;
  host: string[] | string;
  duration: number;
  breakTime: number;
  availabilityInterval: number;
  operatingHours: string;
  minNotice: number;
  maxParticipants?: number;
  actionAfterRegistration: 'success_message' | 'redirect_url';
  successMessage?: string;
  redirectUrl?: string;
  sendReminders: boolean;
  reminders: Reminder[];
  serviceTypes: string[];
};


