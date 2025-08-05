// Re-exportações do módulo refatorado
export * from './eventForm';

// Hook principal (mantido para compatibilidade)
export { useEventFormDialog as default } from './eventForm';

// Importações específicas para o hook legado
import { useEventFormDialog as useEventFormDialogRefactored } from './eventForm';
import type { UseEventFormDialogProps, UseEventFormDialogReturn } from './eventForm/types';

/**
 * Hook legado para compatibilidade com código existente
 * @deprecated Use useEventFormDialog from './eventForm' instead
 * 
 * Este hook agora é um wrapper que utiliza a versão refatorada
 */
export const useEventFormDialog = ({ event, open }: UseEventFormDialogProps): UseEventFormDialogReturn => {
  return useEventFormDialogRefactored({ event, open });
};

export default useEventFormDialog;