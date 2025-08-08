// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ObjectionFormProps {
  isEditing: boolean;
  question: string;
  answer: string;
  setQuestion: (v: string) => void;
  setAnswer: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const ObjectionForm: React.FC<ObjectionFormProps> = ({ isEditing, question, answer, setQuestion, setAnswer, onSubmit, onCancel, disabled }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{isEditing ? 'Editar Objeção' : 'Nova Objeção'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Objeção do Cliente</label>
          <Input placeholder="Ex: O preço está muito alto" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Resposta Sugerida</label>
          <Textarea placeholder="Digite uma resposta persuasiva para essa objeção..." value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={onSubmit} disabled={disabled}>
            {isEditing ? 'Atualizar' : 'Adicionar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectionForm;


