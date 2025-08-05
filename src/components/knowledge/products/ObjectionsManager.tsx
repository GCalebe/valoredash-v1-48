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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingObjection, setEditingObjection] = useState<Objection | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    console.log('🔄 ObjectionsManager useEffect triggered');
    console.log('🎯 ProductId:', productId);
    console.log('👤 User:', user);
    console.log('📝 Initial objections length:', initialObjections.length);
    
    if (productId && productId.trim() !== '' && user) {
      console.log('💾 Loading objections from database for existing product');
      loadObjections();
    } else if (initialObjections.length > 0 && objections.length === 0) {
      console.log('📥 Using initial objections for new product');
      setObjections(initialObjections);
    } else if (!productId || productId.trim() === '') {
      console.log('🆕 New product mode - starting with empty objections');
      // For new products, start with empty objections unless initialObjections are provided
      if (objections.length === 0 && initialObjections.length === 0) {
        setObjections([]);
      }
    }
  }, [productId, user, initialObjections.length]); // Use length to avoid infinite loops

  const loadObjections = async () => {
    if (!user || !productId) {
      console.log('❌ Missing user or productId for loading objections');
      console.log('👤 User:', user);
      console.log('🎯 ProductId:', productId);
      return;
    }
    
    console.log('🔄 Starting to load objections...');
    console.log('🎯 ProductId:', productId);
    console.log('👤 User ID:', user.id);
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_objections')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📊 Supabase query result:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      const formattedObjections = data?.map(obj => ({
        id: obj.id,
        question: obj.question,
        answer: obj.answer,
        createdAt: new Date(obj.created_at).toLocaleDateString(),
        createdBy: obj.created_by || 'Usuário'
      })) || [];

      console.log('✅ Formatted objections:', formattedObjections);
      setObjections(formattedObjections);
      onObjectionsChange?.(formattedObjections);
    } catch (error) {
      console.error('❌ Error loading objections:', error);
      setObjections([]);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as objeções.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Load objections finished');
    }
  };

  const handleAddObjection = async () => {
    console.log('🔍 handleAddObjection called');
    console.log('📝 Question:', newQuestion.trim());
    console.log('📝 Answer:', newAnswer.trim());
    console.log('👤 User:', user);
    console.log('🎯 ProductId:', productId);

    // Validate required fields
    if (!newQuestion.trim() || !newAnswer.trim()) {
      console.log('❌ Missing question or answer');
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha tanto a objeção quanto a resposta.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.log('❌ No user found');
      toast({
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    // For new products (empty productId), manage objections locally
    if (!productId || productId.trim() === '') {
      console.log('🔄 Managing objection locally for new product');
      
      const localObjection: Objection = {
        id: `temp-${Date.now()}`, // Temporary ID for local management
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        createdAt: new Date().toLocaleDateString(),
        createdBy: 'Usuário'
      };

      const updatedObjections = [localObjection, ...objections];
      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);
      setNewQuestion('');
      setNewAnswer('');
      setIsAddingNew(false);

      toast({
        title: "Objeção adicionada",
        description: "A objeção será salva quando o produto for criado.",
      });
      
      console.log('✅ Local objection added successfully');
      return;
    }

    // For existing products, save to database
    try {
      console.log('💾 Saving objection to database');
      
      const { data, error } = await supabase
        .from('product_objections')
        .insert({
          product_id: productId,
          user_id: user.id,
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const newObjection: Objection = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        createdAt: new Date(data.created_at).toLocaleDateString(),
        createdBy: 'Usuário'
      };

      const updatedObjections = [newObjection, ...objections];
      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);
      setNewQuestion('');
      setNewAnswer('');
      setIsAddingNew(false);

      toast({
        title: "Objeção adicionada",
        description: "A objeção foi adicionada com sucesso.",
      });
      
      console.log('✅ Database objection added successfully');
    } catch (error) {
      console.error('❌ Error adding objection:', error);
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
    if (!editingObjection || !newQuestion.trim() || !newAnswer.trim() || !user) return;

    // For local objections (temporary IDs), update locally
    if (editingObjection.id.startsWith('temp-')) {
      console.log('🔄 Updating local objection');
      
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
        description: "A objeção foi atualizada localmente.",
      });
      return;
    }

    // For database objections, update in database
    try {
      const { error } = await supabase
        .from('product_objections')
        .update({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          updated_by: user.id
        })
        .eq('id', editingObjection.id)
        .eq('user_id', user.id);

      if (error) throw error;

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
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a objeção.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteObjection = async (objectionId: string) => {
    if (!user) return;

    // For local objections (temporary IDs), delete locally
    if (objectionId.startsWith('temp-')) {
      console.log('🔄 Deleting local objection');
      
      const updatedObjections = objections.filter(obj => obj.id !== objectionId);
      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);

      toast({
        title: "Objeção removida",
        description: "A objeção foi removida localmente.",
      });
      return;
    }

    // For database objections, delete from database
    try {
      const { error } = await supabase
        .from('product_objections')
        .delete()
        .eq('id', objectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      const updatedObjections = objections.filter(obj => obj.id !== objectionId);
      setObjections(updatedObjections);
      onObjectionsChange?.(updatedObjections);

      toast({
        title: "Objeção removida",
        description: "A objeção foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting objection:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a objeção.",
        variant: "destructive",
      });
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
          type="button"
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
                type="button"
                onClick={editingObjection ? handleUpdateObjection : handleAddObjection}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
              >
                {editingObjection ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button 
                type="button"
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
              <Button type="button" onClick={() => setIsAddingNew(true)}>
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
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={() => handleEditObjection(objection.id)}
                       >
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