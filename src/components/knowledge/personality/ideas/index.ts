// Exportações das diferentes variações de telas de configuração de personalidade da IA

export { default as ModernConfigurationView } from './ModernConfigurationView';
export { default as CardBasedConfigurationView } from './CardBasedConfigurationView';
export { default as SidebarConfigurationView } from './SidebarConfigurationView';
export { default as WizardConfigurationView } from './WizardConfigurationView';
export { default as SplitScreenConfigurationView } from './SplitScreenConfigurationView';

// Tipos e interfaces compartilhadas
export interface PersonalityConfig {
  name: string;
  description: string;
  category: string;
  professionalism: number[];
  warmth: number[];
  efficiency: number[];
  patience: number[];
  proactivity: number[];
  useEmojis: boolean;
  contextAware: boolean;
  continuousLearning: boolean;
  responseSpeed: 'immediate' | 'thoughtful' | 'detailed';
  responseLength: 'concise' | 'moderate' | 'detailed';
  greetingMessage: string;
  errorMessage: string;
  systemPrompt: string;
  temperature: number[];
  topP: number[];
  maxTokens: number[];
}

export interface ConfigurationViewProps {
  config: PersonalityConfig;
  onConfigChange: (config: PersonalityConfig) => void;
}

// Constantes úteis
export const DEFAULT_PERSONALITY_CONFIG: PersonalityConfig = {
  name: 'Secretária Padrão',
  description: 'Configuração equilibrada para atendimento geral',
  category: 'balanced',
  professionalism: [75],
  warmth: [70],
  efficiency: [80],
  patience: [75],
  proactivity: [70],
  useEmojis: true,
  contextAware: true,
  continuousLearning: true,
  responseSpeed: 'thoughtful',
  responseLength: 'moderate',
  greetingMessage: 'Olá! Sou sua secretária virtual. Como posso ajudá-lo com seu agendamento?',
  errorMessage: 'Desculpe, ocorreu um erro. Vou transferir você para um atendente humano.',
  systemPrompt: 'Você é uma secretária virtual equilibrada e prestativa. Ajude com agendamentos de forma clara e eficiente.',
  temperature: [0.7],
  topP: [0.9],
  maxTokens: [1000]
};

export const PERSONALITY_CATEGORIES = [
  { value: 'professional', label: 'Profissional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Consultiva' },
  { value: 'luxury', label: 'Premium' },
  { value: 'balanced', label: 'Equilibrada' }
];

export const RESPONSE_SPEED_OPTIONS = [
  { value: 'immediate', label: 'Imediato' },
  { value: 'thoughtful', label: 'Ponderado' },
  { value: 'detailed', label: 'Detalhado' }
];

export const RESPONSE_LENGTH_OPTIONS = [
  { value: 'concise', label: 'Conciso' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'detailed', label: 'Detalhado' }
];