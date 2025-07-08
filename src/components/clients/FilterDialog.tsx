import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Filter,
  X,
  Plus,
  Save,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomFieldFilter } from "@/hooks/useClientsFilters";

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  customFieldFilters: CustomFieldFilter[];
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
  onAddCustomFieldFilter: (filter: CustomFieldFilter) => void;
  onRemoveCustomFieldFilter: (fieldId: string) => void;
  onClearFilters: () => void;
  onClearCustomFieldFilters: () => void;
  hasActiveFilters: boolean;
}

// Lista estática de propriedades do cliente para filtros
const clientProperties = [
  { id: "name", name: "Nome", type: "text" },
  { id: "email", name: "Email", type: "text" },
  { id: "phone", name: "Telefone", type: "text" },
  {
    id: "status",
    name: "Status",
    type: "select",
    options: ["Ativo", "Inativo", "Pendente"],
  },
  {
    id: "consultationStage",
    name: "Etapa da Consulta",
    type: "select",
    options: ["Agendada", "Realizada", "Cancelada"],
  },
  { id: "source", name: "Origem", type: "text" },
  { id: "city", name: "Cidade", type: "text" },
  { id: "state", name: "Estado", type: "text" },
  { id: "lastContact", name: "Último Contato", type: "date" },
  { id: "nextContact", name: "Próximo Contato", type: "date" },
];

// Lista de tags disponíveis
const availableTags = [
  "Entraram",
  "Conversaram",
  "Agendaram",
  "Compareceram",
  "Negociaram",
  "Postergaram",
  "Converteram",
];

// Operadores de comparação disponíveis por tipo de campo
const operatorsByType = {
  text: [
    { id: "equals", name: "é igual a" },
    { id: "contains", name: "contém" },
    { id: "startsWith", name: "começa com" },
    { id: "endsWith", name: "termina com" },
    { id: "notEquals", name: "não é igual a" },
    { id: "notContains", name: "não contém" },
  ],
  select: [
    { id: "equals", name: "é igual a" },
    { id: "notEquals", name: "não é igual a" },
  ],
  date: [
    { id: "equals", name: "é igual a" },
    { id: "before", name: "é antes de" },
    { id: "after", name: "é depois de" },
    { id: "between", name: "está entre" },
  ],
};

// Tipos de condição para grupos
type ConditionType = "AND" | "OR";

// Interface para uma regra de filtro
interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  fieldName?: string;
}

// Interface para um grupo de filtros
interface FilterGroup {
  id: string;
  condition: ConditionType;
  rules: (FilterRule | FilterGroup)[];
}

// Componente para uma regra de filtro individual
const FilterRuleComponent = ({
  rule,
  onUpdate,
  onRemove,
  isLast,
}: {
  rule: FilterRule;
  onUpdate: (id: string, updatedRule: FilterRule) => void;
  onRemove: (id: string) => void;
  isLast: boolean;
}) => {
  const selectedField = clientProperties.find((f) => f.id === rule.field);
  const operators = selectedField
    ? operatorsByType[selectedField.type as keyof typeof operatorsByType]
    : [];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-muted/30 rounded-md">
      <Select
        value={rule.field}
        onValueChange={(value) => {
          const field = clientProperties.find((f) => f.id === value);
          onUpdate(rule.id, {
            ...rule,
            field: value,
            fieldName: field?.name,
            operator:
              operatorsByType[field?.type as keyof typeof operatorsByType][0]
                .id,
            value: "",
          });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Selecione o campo" />
        </SelectTrigger>
        <SelectContent>
          {clientProperties.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={rule.operator}
        onValueChange={(value) => {
          onUpdate(rule.id, { ...rule, operator: value });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Operador" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.id} value={op.id}>
              {op.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedField?.type === "select" ? (
        <Select
          value={rule.value}
          onValueChange={(value) => {
            onUpdate(rule.id, { ...rule, value });
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Valor" />
          </SelectTrigger>
          <SelectContent>
            {selectedField.options?.map((option: string) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={rule.value}
          onChange={(e) =>
            onUpdate(rule.id, { ...rule, value: e.target.value })
          }
          placeholder="Valor"
          className="w-[140px]"
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(rule.id)}
        className="h-8 w-8 text-destructive hover:text-destructive/80"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Componente recursivo para um grupo de filtros
const FilterGroupComponent = ({
  group,
  onUpdate,
  onRemove,
  level = 0,
  isRoot = false,
}: {
  group: FilterGroup;
  onUpdate: (id: string, updatedGroup: FilterGroup) => void;
  onRemove: (id: string) => void;
  level?: number;
  isRoot?: boolean;
}) => {
  const addRule = () => {
    const newRule: FilterRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: clientProperties[0].id,
      fieldName: clientProperties[0].name,
      operator:
        operatorsByType[
          clientProperties[0].type as keyof typeof operatorsByType
        ][0].id,
      value: "",
    };

    onUpdate(group.id, {
      ...group,
      rules: [...group.rules, newRule],
    });
  };

  const addGroup = () => {
    const newGroup: FilterGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      condition: "AND",
      rules: [],
    };

    onUpdate(group.id, {
      ...group,
      rules: [...group.rules, newGroup],
    });
  };

  const updateRule = (id: string, updatedRule: FilterRule) => {
    onUpdate(group.id, {
      ...group,
      rules: group.rules.map((item) =>
        "field" in item && item.id === id ? updatedRule : item,
      ),
    });
  };

  const updateNestedGroup = (id: string, updatedGroup: FilterGroup) => {
    onUpdate(group.id, {
      ...group,
      rules: group.rules.map((item) =>
        !("field" in item) && item.id === id ? updatedGroup : item,
      ),
    });
  };

  const removeRule = (id: string) => {
    onUpdate(group.id, {
      ...group,
      rules: group.rules.filter((item) => item.id !== id),
    });
  };

  const toggleCondition = () => {
    onUpdate(group.id, {
      ...group,
      condition: group.condition === "AND" ? "OR" : "AND",
    });
  };

  return (
    <div
      className={`border rounded-md p-3 mb-3 ${level > 0 ? "ml-4" : ""} ${
        level > 0 ? "bg-muted/20" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCondition}
            className={`text-xs font-medium ${
              group.condition === "AND"
                ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                : "bg-orange-100 hover:bg-orange-200 text-orange-700"
            } border-none`}
          >
            {group.condition}
          </Button>
          <span className="text-sm text-muted-foreground">
            {group.condition === "AND"
              ? "Todas as condições devem ser verdadeiras"
              : "Qualquer condição pode ser verdadeira"}
          </span>
        </div>
        {!isRoot && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(group.id)}
            className="h-7 w-7 text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {group.rules.map((rule, index) =>
          "field" in rule ? (
            <FilterRuleComponent
              key={rule.id}
              rule={rule}
              onUpdate={updateRule}
              onRemove={removeRule}
              isLast={index === group.rules.length - 1}
            />
          ) : (
            <FilterGroupComponent
              key={rule.id}
              group={rule}
              onUpdate={updateNestedGroup}
              onRemove={removeRule}
              level={level + 1}
            />
          ),
        )}

        {group.rules.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Adicione regras ou grupos para criar seu filtro
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={addRule}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Regra
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addGroup}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Grupo
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para salvar filtros
const SavedFilters = ({
  savedFilters,
  onApplySavedFilter,
  onDeleteSavedFilter,
}: {
  savedFilters: { id: string; name: string; filter: FilterGroup }[];
  onApplySavedFilter: (filter: FilterGroup) => void;
  onDeleteSavedFilter: (id: string) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Filtros Salvos</Label>
      {savedFilters.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">
          Nenhum filtro salvo. Crie e salve filtros para uso futuro.
        </div>
      ) : (
        <div className="space-y-2">
          {savedFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
            >
              <span className="font-medium">{filter.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplySavedFilter(filter.filter)}
                  className="h-7 px-2 text-xs"
                >
                  Aplicar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSavedFilter(filter.id)}
                  className="h-7 w-7 text-destructive hover:text-destructive/80"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para filtros rápidos
const QuickFilters = ({
  statusFilter,
  segmentFilter,
  lastContactFilter,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
}: {
  statusFilter: string;
  segmentFilter: string;
  lastContactFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSegmentFilterChange: (value: string) => void;
  onLastContactFilterChange: (value: string) => void;
}) => {
  const [tagInput, setTagInput] = useState("");

  // Filtrar tags com base na pesquisa
  const filteredTags =
    tagInput.trim() !== ""
      ? availableTags.filter((tag) =>
          tag.toLowerCase().includes(tagInput.toLowerCase()),
        )
      : [];

  // Adicionar tag como filtro
  const handleAddTag = (tag: string) => {
    onSegmentFilterChange(tag);
    setTagInput("");
  };

  return (
    <div className="space-y-4">
      {/* Filtros Rápidos - Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={statusFilter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onStatusFilterChange("all")}
          >
            Todos
          </Badge>
          <Badge
            variant={statusFilter === "Active" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onStatusFilterChange("Active")}
          >
            Ativos
          </Badge>
          <Badge
            variant={statusFilter === "Inactive" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onStatusFilterChange("Inactive")}
          >
            Inativos
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Filtros Rápidos - Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={segmentFilter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onSegmentFilterChange("all")}
          >
            Todas
          </Badge>
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={segmentFilter === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onSegmentFilterChange(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Adicionar Tag */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Adicionar Tag</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Digite uma tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
            {filteredTags.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-700">
                {filteredTags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            size="sm"
            disabled={!tagInput.trim()}
            onClick={() => handleAddTag(tagInput)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filtros Rápidos - Último Contato */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Último Contato</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={lastContactFilter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onLastContactFilterChange("all")}
          >
            Todos
          </Badge>
          <Badge
            variant={lastContactFilter === "today" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onLastContactFilterChange("today")}
          >
            Hoje
          </Badge>
          <Badge
            variant={lastContactFilter === "week" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onLastContactFilterChange("week")}
          >
            Esta semana
          </Badge>
          <Badge
            variant={lastContactFilter === "month" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onLastContactFilterChange("month")}
          >
            Este mês
          </Badge>
          <Badge
            variant={lastContactFilter === "older" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onLastContactFilterChange("older")}
          >
            Mais antigo
          </Badge>
        </div>
      </div>
    </div>
  );
};

const FilterDialog = ({
  isOpen,
  onOpenChange,
  statusFilter,
  segmentFilter,
  lastContactFilter,
  customFieldFilters,
  onStatusFilterChange,
  onSegmentFilterChange,
  onLastContactFilterChange,
  onAddCustomFieldFilter,
  onRemoveCustomFieldFilter,
  onClearFilters,
  onClearCustomFieldFilters,
  hasActiveFilters,
}: FilterDialogProps) => {
  // Estado para o filtro avançado
  const [rootFilterGroup, setRootFilterGroup] = useState<FilterGroup>({
    id: "root",
    condition: "AND",
    rules: [],
  });

  // Estado para filtros salvos
  const [savedFilters, setSavedFilters] = useState<
    { id: string; name: string; filter: FilterGroup }[]
  >([]);
  const [filterName, setFilterName] = useState("");

  // Função para salvar o filtro atual
  const saveCurrentFilter = () => {
    if (filterName.trim() === "") return;

    const newSavedFilter = {
      id: `filter-${Date.now()}`,
      name: filterName,
      filter: { ...rootFilterGroup },
    };

    setSavedFilters([...savedFilters, newSavedFilter]);
    setFilterName("");
  };

  // Função para aplicar um filtro salvo
  const applyFilter = (filter: FilterGroup) => {
    setRootFilterGroup(filter);
  };

  // Função para excluir um filtro salvo
  const deleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter((filter) => filter.id !== id));
  };

  // Função para lidar com o fechamento do diálogo
  const handleClose = () => {
    onOpenChange(false);
  };

  // Função para lidar com a limpeza de filtros
  const handleClearFilters = () => {
    onClearFilters();
    setRootFilterGroup({
      id: "root",
      condition: "AND",
      rules: [],
    });
  };

  // Converter filtros personalizados para regras de filtro
  useEffect(() => {
    if (customFieldFilters.length > 0) {
      const rules: FilterRule[] = customFieldFilters.map((filter) => ({
        id: `rule-${filter.fieldId}`,
        field: filter.fieldId,
        fieldName: filter.fieldName,
        operator: "equals",
        value: filter.value,
      }));

      // Apenas atualiza se não houver regras definidas pelo usuário
      if (rootFilterGroup.rules.length === 0) {
        setRootFilterGroup({
          ...rootFilterGroup,
          rules,
        });
      }
    }
  }, [customFieldFilters]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Filtros Avançados</DialogTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar todos
              </Button>
            )}
          </div>
          <DialogDescription>
            Crie filtros personalizados para encontrar exatamente o que você
            precisa
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(100vh-220px)] pr-4">
          <div className="space-y-6">
            {/* Filtros Salvos */}
            <SavedFilters
              savedFilters={savedFilters}
              onApplySavedFilter={applyFilter}
              onDeleteSavedFilter={deleteFilter}
            />

            <Separator />

            {/* Filtros Rápidos */}
            <QuickFilters
              statusFilter={statusFilter}
              segmentFilter={segmentFilter}
              lastContactFilter={lastContactFilter}
              onStatusFilterChange={onStatusFilterChange}
              onSegmentFilterChange={onSegmentFilterChange}
              onLastContactFilterChange={onLastContactFilterChange}
            />

            <Separator />

            {/* Construtor de Filtros Avançados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Construtor de Filtros
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nome do filtro"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-[200px] h-8 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveCurrentFilter}
                    disabled={
                      filterName.trim() === "" ||
                      rootFilterGroup.rules.length === 0
                    }
                    className="flex items-center gap-1 h-8"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Salvar
                  </Button>
                </div>
              </div>

              <FilterGroupComponent
                group={rootFilterGroup}
                onUpdate={(id, updatedGroup) => {
                  if (id === "root") {
                    setRootFilterGroup(updatedGroup);
                  }
                }}
                onRemove={() => {}}
                isRoot={true}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t mt-4">
          <Button onClick={handleClose}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
