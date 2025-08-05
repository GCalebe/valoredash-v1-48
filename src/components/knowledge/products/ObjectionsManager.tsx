// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Objection {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  createdBy: string;
}

interface ObjectionsManagerProps {
  productId: string;
  onObjectionsChange?: (objections: Objection[]) => void;
  initialObjections?: Objection[];
}

const ObjectionsManager: React.FC<ObjectionsManagerProps> = ({ 
  productId, 
  onObjectionsChange,
  initialObjections = []
}) => {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingObjection, setEditingObjection] = useState<Objection | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    if (productId) {
      loadObjections();
    } else if (initialObjections.length > 0) {
      setObjections(initialObjections);
    }
  }, [productId, initialObjections]);

  const loadObjections = async () => {
    setIsLoading(true);
    try {
      // Since product_objections table doesn't exist, we'll use placeholder data
      // You can create this table later if needed
      setObjections([
        {
          id: '1',
          question: 'O preço está muito alto',
          answer: 'Entendo sua preocupação com o investimento. Nosso produto oferece um ROI comprovado de 300% em 6 meses...',
          createdAt: new Date().toLocaleDateString(),
          createdBy: 'Sistema'
        },
        {
          id: '2',
          question: 'Não tenho tempo para implementar',
          answer: 'Oferecemos suporte completo na implementação, com nossa equipe dedicada que cuida de todo o processo...',
          createdAt: new Date().toLocaleDateString(),
          createdBy: 'Sistema'
        }
      ]);
    } catch (error) {
      console.error('Error loading objections:', error);
      setObjections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddObjection = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const newObjection: Objection = {
        id: Date.now().toString(),
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        createdAt: new Date().toLocaleDateString(),
        createdBy: 'Usuário'
      };

      const updatedObjections = [...objections, newObjection];
      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);
      setNewQuestion('');
      setNewAnswer('');
      setIsAddingNew(false);

      toast({
        title: "Objeção adicionada",
        description: "A objeção foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error('Error adding objection:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a objeção.",
        variant: "destructive",
      });
    }
  };

  const handleEditObjection = (objectionId: string) => {
    const objection = objections.find(o => o.id === objectionId);
    if (!objection) return;

    setEditingObjection(objection);
    setNewQuestion(objection.question);
    setNewAnswer(objection.answer);
  };

  const handleUpdateObjection = async () => {
    if (!editingObjection || !newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const updatedObjections = objections.map(obj => 
        obj.id === editingObjection.id 
          ? { ...obj, question: newQuestion.trim(), answer: newAnswer.trim() }
          : obj
      );

      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);
      setEditingObjection(null);
      setNewQuestion('');
      setNewAnswer('');

      toast({
        title: "Objeção atualizada",
        description: "A objeção foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating objection:', error);
    }
  };

  const handleDeleteObjection = async (objectionId: string) => {
    try {
      const updatedObjections = objections.filter(obj => obj.id !== objectionId);
      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);

      toast({
        title: "Objeção removida",
        description: "A objeção foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting objection:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando objeções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <Button 
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Objeção
        </Button>
      </div>

      {/* Form for adding/editing objections */}
      {(isAddingNew || editingObjection) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingObjection ? 'Editar Objeção' : 'Nova Objeção'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Objeção do Cliente</label>
              <Input
                placeholder="Ex: O preço está muito alto"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Resposta Sugerida</label>
              <Textarea
                placeholder="Digite uma resposta persuasiva para essa objeção..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={editingObjection ? handleUpdateObjection : handleAddObjection}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
              >
                {editingObjection ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingObjection(null);
                  setNewQuestion('');
                  setNewAnswer('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objections list */}
      <div className="space-y-4">
        {objections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma objeção cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando objeções comuns que seus clientes fazem
              </p>
              <Button onClick={() => setIsAddingNew(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Objeção
              </Button>
            </CardContent>
          </Card>
        ) : (
          objections.map((objection) => (
            <Card key={objection.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-sm">Objeção</span>
                      </div>
                      <p className="font-medium">{objection.question}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditObjection(objection.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
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
                            <AlertDialogAction onClick={() => handleDeleteObjection(objection.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Resposta Sugerida</span>
                    </div>
                    <p className="text-muted-foreground">{objection.answer}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Criado por: {objection.createdBy}</span>
                    <span>{objection.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {objections.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">💡 Dica</h4>
          <p className="text-sm text-muted-foreground">
            Use essas respostas como base durante suas vendas. Personalize-as conforme o contexto específico de cada cliente.
          </p>
        </div>
      )}
    </div>
  );
};

export default ObjectionsManager;