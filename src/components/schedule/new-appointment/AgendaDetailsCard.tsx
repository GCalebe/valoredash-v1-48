// @ts-nocheck
import React from "react";
import { Calendar, UserCheck, Clock } from "lucide-react";

interface AgendaDetailsCardProps {
  selectedAgenda?: any;
  selectedAgendaHost?: string;
}

const AgendaDetailsCard: React.FC<AgendaDetailsCardProps> = ({ selectedAgenda, selectedAgendaHost }) => {
  if (!selectedAgenda) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedAgenda.name}</h3>
            <p className="text-sm text-gray-600">Título do Agendamento</p>
          </div>
          <div>
            <p className="text-sm text-gray-900 mb-1 line-clamp-2">{selectedAgenda.description || 'Sem descrição disponível'}</p>
            <p className="text-xs text-gray-600">Descrição</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">{selectedAgendaHost || 'Carregando...'}</span>
            </div>
            <p className="text-xs text-gray-600">Anfitrião/Consultor</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">{selectedAgenda.duration_minutes} minutos</span>
            </div>
            <p className="text-xs text-gray-600">Duração</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaDetailsCard;


