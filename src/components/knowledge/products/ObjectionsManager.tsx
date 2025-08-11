// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useProductObjections } from '@/hooks/useProductObjections';
import ObjectionForm from './components/ObjectionForm';
import ObjectionsHeader from './components/ObjectionsHeader';
import ObjectionsList from './components/ObjectionsList';
import ObjectionsTips from './components/ObjectionsTips';

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
  const { objections, isLoading, addObjection, updateObjection, deleteObjection, loadObjections } = useProductObjections(productId, initialObjections as any);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingObjection, setEditingObjection] = useState<Objection | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    if (productId) loadObjections();
  }, [productId, loadObjections]);

  // carregamento é feito via hook

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

    const ok = await addObjection(newQuestion, newAnswer);
    if (ok) {
      setNewQuestion('');
      setNewAnswer('');
      setIsAddingNew(false);
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
    if (!editingObjection) return;
    const ok = await updateObjection(editingObjection, newQuestion, newAnswer);
    if (ok) {
      setEditingObjection(null);
      setNewQuestion('');
      setNewAnswer('');
    }
  };

  const handleDeleteObjection = async (objectionId: string) => {
    const ok = await deleteObjection(objectionId);
    if (ok) {
      toast({ title: 'Objeção removida', description: 'A objeção foi removida.' });
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
      <ObjectionsHeader onAddNew={() => setIsAddingNew(true)} />

      {/* Form for adding/editing objections */}
      {(isAddingNew || editingObjection) && (
        <ObjectionForm
          isEditing={!!editingObjection}
          question={newQuestion}
          answer={newAnswer}
          setQuestion={setNewQuestion}
          setAnswer={setNewAnswer}
          onSubmit={editingObjection ? handleUpdateObjection : handleAddObjection}
          onCancel={() => {
            setIsAddingNew(false);
            setEditingObjection(null);
            setNewQuestion('');
            setNewAnswer('');
          }}
          disabled={!newQuestion.trim() || !newAnswer.trim()}
        />
      )}

      <ObjectionsList
        objections={objections}
        onAddFirst={() => setIsAddingNew(true)}
        onEdit={handleEditObjection}
        onDelete={handleDeleteObjection}
      />
      
      <ObjectionsTips count={objections.length} />
    </div>
  );
};

export default ObjectionsManager;