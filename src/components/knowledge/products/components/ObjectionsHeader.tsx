import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';

interface ObjectionsHeaderProps {
  onAddNew: () => void;
}

const ObjectionsHeader: React.FC<ObjectionsHeaderProps> = ({ onAddNew }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Gerenciar Objeções
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure respostas para objeções comuns dos clientes
        </p>
      </div>
      <Button type="button" onClick={onAddNew} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nova Objeção
      </Button>
    </div>
  );
};

export default ObjectionsHeader;


