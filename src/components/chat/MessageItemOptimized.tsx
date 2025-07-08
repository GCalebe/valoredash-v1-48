import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Ship } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
  isClient: boolean;
}

/**
 * Componente otimizado para renderização de mensagens individuais
 * Utiliza React.memo para evitar re-renderizações desnecessárias
 */
export const MessageItemOptimized = React.memo(
  ({ message, isClient }: MessageItemProps) => {
    const { themeSettings } = useThemeSettings();
    
    // Formatar timestamp relativo (ex: "há 5 minutos")
    const formattedTime = React.useMemo(() => {
      if (!message.timestamp) return '';
      
      try {
        return formatDistanceToNow(new Date(message.timestamp), {
          addSuffix: true,
          locale: ptBR,
        });
      } catch (error) {
        return '';
      }
    }, [message.timestamp]);
    
    return (
      <div
        className={cn(
          'flex items-start gap-3 max-w-[80%]',
          isClient ? 'self-start' : 'self-end ml-auto'
        )}
      >
        {isClient && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'rounded-lg p-3',
              isClient
                ? 'bg-muted'
                : {
                    'bg-primary text-primary-foreground':
                      !themeSettings?.chatBubbleColor,
                    [themeSettings?.chatBubbleColor || '']:
                      !!themeSettings?.chatBubbleColor,
                  }
            )}
            style={{
              backgroundColor: isClient
                ? undefined
                : themeSettings?.chatBubbleColor,
              color: isClient
                ? undefined
                : themeSettings?.chatBubbleTextColor,
            }}
          >
            {message.content}
          </div>
          
          <span className="text-xs text-muted-foreground self-end">
            {formattedTime}
          </span>
        </div>
        
        {!isClient && (
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="bg-primary text-primary-foreground"
              style={{
                backgroundColor: themeSettings?.chatBubbleColor,
                color: themeSettings?.chatBubbleTextColor,
              }}
            >
              <Ship className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  },
  // Função de comparação personalizada para o React.memo
  (prevProps, nextProps) => {
    // Só re-renderiza se a mensagem ou o status de cliente mudar
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.isClient === nextProps.isClient
    );
  }
);

// Definir displayName para facilitar depuração
MessageItemOptimized.displayName = 'MessageItemOptimized';