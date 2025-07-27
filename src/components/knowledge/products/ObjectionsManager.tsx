import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X, Target } from "lucide-react";
import { ProductObjection } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ObjectionsManagerProps {
  productId?: string;
  onObjectionsChange?: (objections: ProductObjection[]) => void;
  initialObjections?: ProductObjection[];
}

const ObjectionsManager: React.FC<ObjectionsManagerProps> = ({
  productId,
  onObjectionsChange,
  initialObjections = []
}) => {
  const [objections, setObjections] = useState<ProductObjection[]>(initialObjections);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newObjection, setNewObjection] = useState({ question: "", answer: "" });
  const [editObjection, setEditObjection] = useState({ question: "", answer: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadObjections = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      // Tentar carregar da tabela product_objections
      const { data, error } = await supabase
        .from('product_objections')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) {
        // Se a tabela não existir, usar dados do campo objections do produto
        console.log('Tabela product_objections não encontrada, usando campo objections do produto');
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('objections')
          .eq('id', productId)
          .single();
        
        if (productError) throw productError;
        
        const legacyObjections = (productData?.objections || []).map((obj: string, index: number) => ({
          id: `legacy-${index}`,
          question: obj,
          answer: 'Resposta não definida'
        }));
        
        setObjections(legacyObjections);
        onObjectionsChange?.(legacyObjections);
        setIsLoading(false);
        return;
      }
      
      const loadedObjections = data?.map(item => ({
        id: item.id,
        question: item.question,
        answer: item.answer
      })) || [];
      
      setObjections(loadedObjections);
      onObjectionsChange?.(loadedObjections);
    } catch (error) {
      console.error('Erro ao carregar objeções:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as objeções.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load objections from database when productId is provided
  useEffect(() => {
    if (productId) {
      loadObjections();
    }
  }, [productId]);

  const saveObjection = async (objection: ProductObjection) => {
    if (!productId || !user) {
      // Se não há productId, retorna com ID temporário
      return {
        ...objection,
        id: `temp-${Date.now()}`
      };
    }

    try {
      const { data, error } = await supabase
        .from('product_objections')
        .insert({
          product_id: productId,
          question: objection.question,
          answer: objection.answer,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.log('Tabela product_objections não disponível, usando apenas estado local');
        return {
          ...objection,
          id: `temp-${Date.now()}`
        };
      }
      
      return {
        id: data.id,
        question: data.question,
        answer: data.answer
      };
    } catch (error) {
      console.error('Erro ao salvar objeção:', error);
      return {
        ...objection,
        id: `temp-${Date.now()}`
      };
    }
  };

  const updateObjection = async (id: string, objection: Omit<ProductObjection, 'id'>) => {
    if (!productId) return;

    try {
      const { error } = await supabase
        .from('product_objections')
        .update({
          question: objection.question,
          answer: objection.answer
        })
        .eq('id', id);

      if (error) {
        console.log('Tabela product_objections não disponível, atualizando apenas estado local');
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "Objeção atualizada com sucesso."
      });
    } catch (error) {
      console.log('Erro ao atualizar objeção, usando apenas estado local:', error);
    }
  };

  const deleteObjection = async (id: string) => {
    if (!productId) return;

    try {
      const { error } = await supabase
        .from('product_objections')
        .delete()
        .eq('id', id);

      if (error) {
        console.log('Tabela product_objections não disponível, removendo apenas do estado local');
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "Objeção removida com sucesso."
      });
    } catch (error) {
      console.log('Erro ao deletar objeção, removendo apenas do estado local:', error);
    }
  };

  const handleAddObjection = async () => {
    if (!newObjection.question.trim() || !newObjection.answer.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha tanto a objeção quanto a resposta.",
        variant: "destructive"
      });
      return;
    }

    const objectionToAdd = {
      question: newObjection.question.trim(),
      answer: newObjection.answer.trim()
    };

    let savedObjection = objectionToAdd;
    if (productId) {
      savedObjection = await saveObjection(objectionToAdd);
    }

    const updatedObjections = [...objections, savedObjection];
    setObjections(updatedObjections);
    onObjectionsChange?.(updatedObjections);
    
    setNewObjection({ question: "", answer: "" });
    setIsAdding(false);
  };

  const handleEditObjection = async (id: string) => {
    if (!editObjection.question.trim() || !editObjection.answer.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha tanto a objeção quanto a resposta.",
        variant: "destructive"
      });
      return;
    }

    const objectionData = {
      question: editObjection.question.trim(),
      answer: editObjection.answer.trim()
    };

    if (productId) {
      await updateObjection(id, objectionData);
    }

    const updatedObjections = objections.map(obj => 
      obj.id === id ? { ...obj, ...objectionData } : obj
    );
    
    setObjections(updatedObjections);
    onObjectionsChange?.(updatedObjections);
    
    setEditingId(null);
    setEditObjection({ question: "", answer: "" });
  };

  const handleDeleteObjection = async (id: string) => {
    if (productId) {
      await deleteObjection(id);
    }

    const updatedObjections = objections.filter(obj => obj.id !== id);
    setObjections(updatedObjections);
    onObjectionsChange?.(updatedObjections);
  };

  const startEdit = (objection: ProductObjection) => {
    setEditingId(objection.id || '');
    setEditObjection({
      question: objection.question,
      answer: objection.answer
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditObjection({ question: "", answer: "" });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Objeções Comuns
        </Label>
        <div className="text-sm text-muted-foreground">Carregando objeções...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Target className="h-4 w-4" />
        Objeções Comuns
      </Label>
      
      {/* Lista de objeções existentes */}
      <div className="space-y-3">
        {objections.map((objection, index) => (
          <Card key={objection.id || index} className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4">
              {editingId === objection.id ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Objeção</Label>
                    <Input
                      value={editObjection.question}
                      onChange={(e) => setEditObjection(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Digite a objeção..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Resposta</Label>
                    <Textarea
                      value={editObjection.answer}
                      onChange={(e) => setEditObjection(prev => ({ ...prev, answer: e.target.value }))}
                      placeholder="Digite a resposta para esta objeção..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditObjection(objection.id!)}>
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Objeção</Label>
                    <p className="text-sm font-medium">{objection.question}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Resposta</Label>
                    <p className="text-sm text-muted-foreground">{objection.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(objection)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteObjection(objection.id!)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário para adicionar nova objeção */}
      {isAdding ? (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Objeção</Label>
                <Input
                  value={newObjection.question}
                  onChange={(e) => setNewObjection(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Digite a objeção..."
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Resposta</Label>
                <Textarea
                  value={newObjection.answer}
                  onChange={(e) => setNewObjection(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Digite a resposta para esta objeção..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddObjection}>
                  <Save className="h-3 w-3 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewObjection({ question: "", answer: "" });
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Nova Objeção
        </Button>
      )}
    </div>
  );
};

export default ObjectionsManager;