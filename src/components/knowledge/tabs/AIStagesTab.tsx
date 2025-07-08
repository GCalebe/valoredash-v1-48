import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AIStage {
  id: number;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  nextStage: string;
  order: number;
  isActive: boolean;
}

const AIStagesTab = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<AIStage | null>(null);

  const [stages, setStages] = useState<AIStage[]>([
    {
      id: 1,
      name: "Saudação Inicial",
      description: "Primeira interação com o usuário",
      trigger: "Início da conversa",
      actions: ["Cumprimentar o usuário", "Perguntar como pode ajudar"],
      nextStage: "Identificação da Necessidade",
      order: 1,
      isActive: true,
    },
    {
      id: 2,
      name: "Identificação da Necessidade",
      description: "Entender o que o usuário precisa",
      trigger: "Usuário responde à saudação",
      actions: [
        "Fazer perguntas qualificadoras",
        "Identificar o tipo de solicitação",
      ],
      nextStage: "Fornecimento de Informações",
      order: 2,
      isActive: true,
    },
    {
      id: 3,
      name: "Fornecimento de Informações",
      description: "Fornecer respostas baseadas na base de conhecimento",
      trigger: "Necessidade identificada",
      actions: ["Buscar informações relevantes", "Fornecer resposta detalhada"],
      nextStage: "Confirmação de Satisfação",
      order: 3,
      isActive: true,
    },
    {
      id: 4,
      name: "Confirmação de Satisfação",
      description: "Verificar se a necessidade foi atendida",
      trigger: "Informação fornecida",
      actions: ["Perguntar se ajudou", "Oferecer ajuda adicional"],
      nextStage: "Encerramento",
      order: 4,
      isActive: true,
    },
    {
      id: 5,
      name: "Encerramento",
      description: "Finalizar a conversa de forma cordial",
      trigger: "Usuário satisfeito ou não precisa de mais ajuda",
      actions: [
        "Agradecer pela interação",
        "Deixar canal aberto para futuras dúvidas",
      ],
      nextStage: "Fim",
      order: 5,
      isActive: true,
    },
  ]);

  const [newStage, setNewStage] = useState({
    name: "",
    description: "",
    trigger: "",
    actions: "",
    nextStage: "",
  });

  const handleAddStage = () => {
    if (!newStage.name || !newStage.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const stage: AIStage = {
      id: Date.now(),
      name: newStage.name,
      description: newStage.description,
      trigger: newStage.trigger,
      actions: newStage.actions.split("\n").filter((action) => action.trim()),
      nextStage: newStage.nextStage,
      order: stages.length + 1,
      isActive: true,
    };

    setStages([...stages, stage]);
    setNewStage({
      name: "",
      description: "",
      trigger: "",
      actions: "",
      nextStage: "",
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Etapa adicionada",
      description: "Nova etapa criada com sucesso!",
    });
  };

  const handleEditStage = (stage: AIStage) => {
    setEditingStage(stage);
    setNewStage({
      name: stage.name,
      description: stage.description,
      trigger: stage.trigger,
      actions: stage.actions.join("\n"),
      nextStage: stage.nextStage,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStage = () => {
    if (!editingStage || !newStage.name || !newStage.description) return;

    const updatedStage: AIStage = {
      ...editingStage,
      name: newStage.name,
      description: newStage.description,
      trigger: newStage.trigger,
      actions: newStage.actions.split("\n").filter((action) => action.trim()),
      nextStage: newStage.nextStage,
    };

    setStages(
      stages.map((stage) =>
        stage.id === editingStage.id ? updatedStage : stage,
      ),
    );

    setNewStage({
      name: "",
      description: "",
      trigger: "",
      actions: "",
      nextStage: "",
    });
    setEditingStage(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Etapa atualizada",
      description: "Etapa atualizada com sucesso!",
    });
  };

  const handleDeleteStage = (id: number) => {
    setStages(stages.filter((stage) => stage.id !== id));
    toast({
      title: "Etapa excluída",
      description: "Etapa removida com sucesso!",
      variant: "destructive",
    });
  };

  const handleToggleStage = (id: number) => {
    setStages(
      stages.map((stage) =>
        stage.id === id ? { ...stage, isActive: !stage.isActive } : stage,
      ),
    );
  };

  const handleMoveStage = (id: number, direction: "up" | "down") => {
    const stageIndex = stages.findIndex((stage) => stage.id === id);
    if (
      (direction === "up" && stageIndex === 0) ||
      (direction === "down" && stageIndex === stages.length - 1)
    ) {
      return;
    }

    const newStages = [...stages];
    const swapIndex = direction === "up" ? stageIndex - 1 : stageIndex + 1;

    [newStages[stageIndex], newStages[swapIndex]] = [
      newStages[swapIndex],
      newStages[stageIndex],
    ];

    // Update order numbers
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });

    setStages(newStages);
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Configuração das Etapas da IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Defina o fluxo de conversação e etapas que a IA deve seguir
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Etapa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Etapa</DialogTitle>
              <DialogDescription>
                Crie uma nova etapa no fluxo de conversação da IA.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Etapa *</Label>
                  <Input
                    id="name"
                    value={newStage.name}
                    onChange={(e) =>
                      setNewStage({ ...newStage, name: e.target.value })
                    }
                    placeholder="Ex: Saudação Inicial"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger">Gatilho</Label>
                  <Input
                    id="trigger"
                    value={newStage.trigger}
                    onChange={(e) =>
                      setNewStage({ ...newStage, trigger: e.target.value })
                    }
                    placeholder="Ex: Início da conversa"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={newStage.description}
                  onChange={(e) =>
                    setNewStage({ ...newStage, description: e.target.value })
                  }
                  placeholder="Descreva o objetivo desta etapa..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="actions">Ações (uma por linha)</Label>
                <Textarea
                  id="actions"
                  value={newStage.actions}
                  onChange={(e) =>
                    setNewStage({ ...newStage, actions: e.target.value })
                  }
                  placeholder="Cumprimentar o usuário&#10;Perguntar como pode ajudar"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="nextStage">Próxima Etapa</Label>
                <Input
                  id="nextStage"
                  value={newStage.nextStage}
                  onChange={(e) =>
                    setNewStage({ ...newStage, nextStage: e.target.value })
                  }
                  placeholder="Ex: Identificação da Necessidade"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddStage}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stages Flow Visualization */}
      <div className="space-y-4">
        {sortedStages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <h3 className="text-lg font-medium mb-1">
              Nenhuma etapa configurada
            </h3>
            <p className="text-sm">
              Comece adicionando etapas ao fluxo de conversação.
            </p>
          </div>
        ) : (
          sortedStages.map((stage, index) => (
            <div key={stage.id} className="relative">
              <Card className={`${!stage.isActive ? "opacity-50" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {stage.order}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {stage.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveStage(stage.id, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveStage(stage.id, "down")}
                        disabled={index === sortedStages.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStage(stage)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStage(stage.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stage.trigger && (
                      <div>
                        <span className="text-sm font-medium">Gatilho:</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                          {stage.trigger}
                        </span>
                      </div>
                    )}

                    {stage.actions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Ações:</span>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 ml-4 mt-1">
                          {stage.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="list-disc">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={stage.isActive ? "default" : "secondary"}
                        >
                          {stage.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStage(stage.id)}
                        >
                          {stage.isActive ? "Desativar" : "Ativar"}
                        </Button>
                      </div>

                      {stage.nextStage && stage.nextStage !== "Fim" && (
                        <div className="flex items-center text-sm text-gray-500">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Próxima: {stage.nextStage}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {index < sortedStages.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
            <DialogDescription>
              Modifique as informações da etapa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome da Etapa *</Label>
                <Input
                  id="edit-name"
                  value={newStage.name}
                  onChange={(e) =>
                    setNewStage({ ...newStage, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-trigger">Gatilho</Label>
                <Input
                  id="edit-trigger"
                  value={newStage.trigger}
                  onChange={(e) =>
                    setNewStage({ ...newStage, trigger: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição *</Label>
              <Textarea
                id="edit-description"
                value={newStage.description}
                onChange={(e) =>
                  setNewStage({ ...newStage, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="edit-actions">Ações (uma por linha)</Label>
              <Textarea
                id="edit-actions"
                value={newStage.actions}
                onChange={(e) =>
                  setNewStage({ ...newStage, actions: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="edit-nextStage">Próxima Etapa</Label>
              <Input
                id="edit-nextStage"
                value={newStage.nextStage}
                onChange={(e) =>
                  setNewStage({ ...newStage, nextStage: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateStage}>Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIStagesTab;
