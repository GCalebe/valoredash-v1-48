import React from 'react';
import { LocalAgenda } from '../AgendaTab';

interface Step4ServiceTypesProps {
  currentAgenda: Omit<LocalAgenda, 'id'>;
  setCurrentAgenda: React.Dispatch<React.SetStateAction<Omit<LocalAgenda, 'id'>>>;
}

export const Step4ServiceTypes: React.FC<Step4ServiceTypesProps> = ({
  currentAgenda,
  setCurrentAgenda
}) => {
  const toggleServiceType = (serviceType: string) => {
    const newTypes = currentAgenda.serviceTypes.includes(serviceType)
      ? currentAgenda.serviceTypes.filter(type => type !== serviceType)
      : [...currentAgenda.serviceTypes, serviceType];
    setCurrentAgenda(prev => ({ ...prev, serviceTypes: newTypes }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Tipos de Atendimento</h3>
      <p className="text-sm text-muted-foreground">Selecione os tipos de atendimento disponíveis para esta agenda. Você pode escolher múltiplas opções.</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentAgenda.serviceTypes.includes('Online') 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/60'
            }`} 
            onClick={() => toggleServiceType('Online')}
          >
            <div className="text-center space-y-2">
              <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${
                currentAgenda.serviceTypes.includes('Online') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="text-2xl">💻</span>
              </div>
              <h4 className="font-semibold text-foreground">Online</h4>
              <p className="text-sm text-muted-foreground">Atendimento virtual via videochamada</p>
            </div>
          </div>
          
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentAgenda.serviceTypes.includes('Presencial') 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/60'
            }`} 
            onClick={() => toggleServiceType('Presencial')}
          >
            <div className="text-center space-y-2">
              <div className={`mx-auto w-16 h-16 rounded-lg flex items-center justify-center ${
                currentAgenda.serviceTypes.includes('Presencial') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <span className="text-2xl">🏢</span>
              </div>
              <h4 className="font-semibold text-foreground">Presencial</h4>
              <p className="text-sm text-muted-foreground">Atendimento no local físico</p>
            </div>
          </div>
        </div>
        
        {currentAgenda.serviceTypes.length === 0 && (
          <p className="text-sm text-destructive text-center">Selecione pelo menos um tipo de atendimento</p>
        )}
      </div>
    </div>
  );
};