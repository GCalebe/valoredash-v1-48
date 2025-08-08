import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import ObjectionItem from './ObjectionItem';

export interface ObjectionListItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  createdBy: string;
}

interface ObjectionsListProps {
  objections: ObjectionListItem[];
  onAddFirst: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ObjectionsList: React.FC<ObjectionsListProps> = ({ objections, onAddFirst, onEdit, onDelete }) => {
  if (objections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma objeção cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando objeções comuns que seus clientes fazem
          </p>
          <Button type="button" onClick={onAddFirst}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Objeção
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {objections.map((objection) => (
        <ObjectionItem
          key={objection.id}
          id={objection.id}
          question={objection.question}
          answer={objection.answer}
          createdBy={objection.createdBy}
          createdAt={objection.createdAt}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ObjectionsList;


