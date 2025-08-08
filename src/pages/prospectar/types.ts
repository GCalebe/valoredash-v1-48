export interface Prospect {
  id: string;
  name: string;
  endereco: string;
  telefone?: string;
  email?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  category?: string;
  types?: string;
  hasWhatsApp: boolean;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
}

export interface APIConfig {
  serpApiKey: string;
  whatsappBaseUrl: string;
  whatsappInstance: string;
  whatsappApiKey: string;
}


