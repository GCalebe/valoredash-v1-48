import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useKanbanStages } from '@/hooks/useKanbanStages';
import { useAIMessagesQuery } from '@/hooks/useAIMessagesQuery';
import { useAIMessagesCrud } from '@/hooks/useAIMessagesCrud';
import AddMessageDialog from '../messages/AddMessageDialog';
import EditMessageDialog from '../messages/EditMessageDialog';
import MessageList from '../messages/MessageList';
import { AIMessage } from '@/types/ai';
import { useToast } from '@/hooks/use-toast';

const AIMessagesTab = () => {
  const { toast } = useToast();
  const { stages, loading: stagesLoading } = useKanbanStages();
  const [activeCategory, setActiveCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AIMessage | null>(null);
  const { data: messages = [], isLoading } = useAIMessagesQuery();
  const {
    addMessage,
    updateMessage,
    deleteMessage,
    toggleMessage,
    copyToClipboard,
    createPending,
    updatePending,
  } = useAIMessagesCrud();

  const [newMessage, setNewMessage] = useState({
    category: '',
    name: '',
    content: '',
    context: '',
  });

  useEffect(() => {
    if (stages.length > 0 && !activeCategory) {
      setActiveCategory(stages[0].title);
      setNewMessage((prev) => ({ ...prev, category: stages[0].title }));
    }
  }, [stages, activeCategory]);

  const getMessagesByCategory = (category: string) =>
    messages.filter((msg) => msg.category === category);

  const handleAddMessage = async () => {
    if (!newMessage.name || !newMessage.content) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e conteúdo são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    await addMessage(newMessage);
    setNewMessage({ category: activeCategory, name: '', content: '', context: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditMessage = (message: AIMessage) => {
    setEditingMessage(message);
    setNewMessage({
      category: message.category || '',
      name: message.name || '',
      content: message.content || '',
      context: message.context || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage) return;
    if (!newMessage.name || !newMessage.content) return;
    await updateMessage(editingMessage.id, newMessage);
    setNewMessage({ category: activeCategory, name: '', content: '', context: '' });
    setEditingMessage(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteMessage = async (id: string) => {
    await deleteMessage(id);
  };

  const handleToggleMessage = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (msg) toggleMessage(msg);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Configuração das Mensagens da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as mensagens que a IA utiliza em diferentes etapas do funil
          </p>
        </div>

        <AddMessageDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onAdd={handleAddMessage}
          isAdding={createPending}
          stages={stages}
          stagesLoading={stagesLoading}
        />
      </div>

      {stagesLoading || isLoading ? (
        <div className="space-y-4">
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Carregando...</span>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
            {stages.map((stage) => (
              <TabsTrigger key={stage.id} value={stage.title} className="text-xs">
                {stage.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {stages.map((stage) => (
            <TabsContent key={stage.id} value={stage.title} className="mt-6">
              <MessageList
                stageTitle={stage.title}
                messages={getMessagesByCategory(stage.title)}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onToggle={handleToggleMessage}
                onCopy={copyToClipboard}
                updating={updatePending}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <EditMessageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onUpdate={handleUpdateMessage}
        isUpdating={updatePending}
        stages={stages}
        stagesLoading={stagesLoading}
      />
    </div>
  );
};

export default AIMessagesTab;
