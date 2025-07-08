
/**
 * Utility functions for client data validation and manipulation
 */

export const validateKanbanStage = (stage: string): boolean => {
  const validStages = [
    'Nova consulta',
    'Consulta marcada',
    'Consulta realizada',
    'Proposta enviada',
    'Negociação',
    'Fechado',
    'Perdido'
  ];
  return validStages.includes(stage);
};

export const formatClientName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
