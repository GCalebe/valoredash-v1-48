import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocalAgenda } from '../AgendaTab';

interface Step5PostRegistrationActionsProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  setCurrentAgenda: React.Dispatch<React.SetStateAction<Omit<LocalAgenda, 'id'>>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const Step5PostRegistrationActions: React.FC<Step5PostRegistrationActionsProps> = ({
  currentAgenda,
  setCurrentAgenda,
  handleInputChange
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Ação após a inscrição</h3>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div 
            className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentAgenda.actionAfterRegistration === 'success_message' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/60'
            }`} 
            onClick={() => setCurrentAgenda(prev => ({ ...prev, actionAfterRegistration: 'success_message' }))}
          >
            <div className="text-center space-y-2">
              <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${
                currentAgenda.actionAfterRegistration === 'success_message' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-semibold text-foreground">Exibir mensagem de sucesso</h4>
              <p className="text-sm text-muted-foreground">Seu cliente verá uma mensagem de confirmação.</p>
            </div>
          </div>
          <div 
            className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentAgenda.actionAfterRegistration === 'redirect_url' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/60'
            }`} 
            onClick={() => setCurrentAgenda(prev => ({ ...prev, actionAfterRegistration: 'redirect_url' }))}
          >
            <div className="text-center space-y-2">
              <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${
                currentAgenda.actionAfterRegistration === 'redirect_url' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="text-2xl">🌐</span>
              </div>
              <h4 className="font-semibold text-foreground">Redirecionar para URL</h4>
              <p className="text-sm text-muted-foreground">O cliente será redirecionado para um site externo.</p>
            </div>
          </div>
        </div>
        
        {currentAgenda.actionAfterRegistration === 'success_message' && (
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">
              Mensagem de sucesso <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea 
                id="successMessage" 
                value={currentAgenda.successMessage || ''} 
                onChange={handleInputChange} 
                placeholder="Obrigado por se inscrever!" 
                className="resize-none" 
                maxLength={255} 
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {(currentAgenda.successMessage || '').length}/255
              </div>
            </div>
          </div>
        )}
        
        {currentAgenda.actionAfterRegistration === 'redirect_url' && (
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">
              URL de redirecionamento <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="redirectUrl" 
              value={currentAgenda.redirectUrl || ''} 
              onChange={handleInputChange} 
              placeholder="https://example.com" 
              type="url" 
            />
          </div>
        )}
      </div>
    </div>
  );
};