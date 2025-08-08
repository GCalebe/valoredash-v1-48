// Tipos compartilhados do Disparador
export interface Instance {
  id: string;
  name: string;
  apikey: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
}

export interface Contact {
  number: string;
  name?: string;
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  contacts: Contact[];
  media?: File;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  sent: number;
  total: number;
  createdAt: Date;
}

export interface ScheduledDispatch {
  id: string;
  scheduledDateTime: Date;
  instanceId: string;
  message: string;
  contacts: Contact[];
  media?: File;
  status: 'scheduled' | 'executing' | 'completed' | 'cancelled' | 'failed';
  createdAt: Date;
}


