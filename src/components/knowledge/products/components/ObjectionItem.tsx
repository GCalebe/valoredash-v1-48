// @ts-nocheck
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface ObjectionItemProps {
  id: string;
  question: string;
  answer: string;
  createdBy: string;
  createdAt: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ObjectionItem: React.FC<ObjectionItemProps> = ({ id, question, answer, createdBy, createdAt, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Objeção</span>
              </div>
              <p className="font-medium">{question}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onEdit(id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir esta objeção? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Resposta Sugerida</span>
            </div>
            <p className="text-muted-foreground">{answer}</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Criado por: {createdBy}</span>
            <span>{createdAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectionItem;


