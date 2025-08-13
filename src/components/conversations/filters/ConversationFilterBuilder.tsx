import { useMemo, useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, ChevronDown, Pencil, X } from "lucide-react";
import { useDebounce } from "@/hooks/utils/useDebounce";
import ReactSelect from "react-select";
import { UnifiedConversationFilters } from "@/hooks/useUnifiedConversationFilters";
import { useFilterableFields } from "@/hooks/useFilterableFields";
import { useKanbanStagesLocal } from "@/hooks/useKanbanStagesLocal";
import { supabase } from "@/integrations/supabase/client";

// LEFT MENU com filtros pré-configurados para conversas
const LEFT_MENU = [
  { label: "Conversas não lidas", editable: true },
  { label: "Minhas conversas", editable: true },
  { label: "Conversas recentes", editable: true },
  { label: "Conversas arquivadas", editable: true },
  { label: "Clientes ativos", editable: true },
];

// Estrutura de seção e campos
type SectionDef = {
  title: string;
  key: string;
  fields: { key: string; placeholder: string }[];
};

// SEÇÕES ESTÁTICAS alinhadas ao formulário "Novo Cliente"
const STATIC_SECTIONS: SectionDef[] = [
  { title: "PRINCIPAL", key: "principal", fields: [
    { key: "name", placeholder: "Nome do cliente" },
    { key: "email", placeholder: "E-mail" },
    { key: "phone", placeholder: "Telefone" },
    { key: "address", placeholder: "Endereço" },
    { key: "notes", placeholder: "Observações" },
    { key: "responsible_hosts", placeholder: "Responsáveis" },
  ] },
  { title: "CLASSIFICAÇÃO", key: "classificacao", fields: [
    { key: "consultation_stage", placeholder: "Estágio de consulta" },
    { key: "tags", placeholder: "Tags" },
  ] },
  { title: "EMPRESA", key: "empresa", fields: [
    { key: "client_name", placeholder: "Nome da empresa" },
    { key: "client_type", placeholder: "Tipo de cliente" },
    { key: "client_size", placeholder: "Porte do cliente" },
  ] },
  { title: "DOCUMENTOS", key: "documentos", fields: [
    { key: "cpf_cnpj", placeholder: "CPF/CNPJ" },
  ] },
  { title: "FINANCEIRO", key: "financeiro", fields: [
    { key: "budget", placeholder: "Orçamento" },
  ] },
] as const;

function FieldRow({ active, onToggle, control }: { active: boolean; onToggle: (active: boolean) => void; control: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={active} onCheckedChange={(v) => onToggle(Boolean(v))} className="h-4 w-4 rounded-[3px] border-gray-300 data-[state=checked]:bg-primary" />
      <div className="flex-1">{control}</div>
    </div>
  );
}

interface ConversationFilterBuilderProps {
  filters: UnifiedConversationFilters;
  onClose: () => void;
  isOpen: boolean;
}

export const ConversationFilterBuilder: React.FC<ConversationFilterBuilderProps> = ({
  filters,
  onClose,
  isOpen,
}) => {
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, any>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [menuSearch, setMenuSearch] = useState("");
  
  // Estados dos filtros rápidos
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [lastContactFilter, setLastContactFilter] = useState("all");
  
  const debouncedMenuSearch = useDebounce(menuSearch, 250);
  const { fields, availableTags, responsibleHosts, responsibleHostsMap, loading: hostsLoading } = useFilterableFields();
  const { stages, loading: kanbanLoading } = useKanbanStagesLocal();
  const [selectedChips, setSelectedChips] = useState<{ key: string; label: string }[]>([]);
  const [fieldOptions, setFieldOptions] = useState<Record<string, { label: string; value: string }[]>>({});
  const customFieldDefs = useMemo(() => (fields || []).filter((f: any) => f.isCustom), [fields]);

  // Seção dinâmica de Campos Personalizados (abaixo de FINANCEIRO)
  const customSection: SectionDef | null = useMemo(() => {
    if (!customFieldDefs || customFieldDefs.length === 0) return null;
    return {
      title: "CAMPOS PERSONALIZADOS",
      key: "campos_personalizados",
      fields: customFieldDefs.map((f: any) => ({ key: f.id, placeholder: f.name })),
    };
  }, [customFieldDefs]);

  const allSections: SectionDef[] = useMemo(() => {
    return customSection ? [...STATIC_SECTIONS, customSection] : [...STATIC_SECTIONS];
  }, [customSection]);

  // Garantir estado de colapso para todas as seções, incluindo a dinâmica
  useEffect(() => {
    setCollapsed((prev) => {
      const next: Record<string, boolean> = { ...prev };
      allSections.forEach((s) => {
        if (typeof next[s.key] === "undefined") next[s.key] = false;
      });
      return next;
    });
  }, [allSections]);

  useEffect(() => {
    let mounted = true;
    async function loadOptions() {
      try {
        const optionsMap: Record<string, { label: string; value: string }[]> = {};
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData?.user?.id || null;

        // Precompute from known sources
        fields.forEach((f: any) => {
          if (f.id === 'tags') {
            optionsMap[f.id] = (availableTags || []).map((t: string) => ({ label: t, value: t }));
          } else if (f.id === 'responsible_hosts') {
            optionsMap[f.id] = (responsibleHosts || []).map((name: string) => ({ label: name, value: responsibleHostsMap[name] || name }));
          } else if (f.id === 'kanban_stage_id') {
            optionsMap[f.id] = (stages || []).map((s: any) => ({ label: s.title, value: s.id }));
          } else if (Array.isArray(f.options) && f.options.length > 0) {
            // fallback to predefined options if exists
            optionsMap[f.id] = f.options.map((o: any) =>
              typeof o === 'string' ? { label: o, value: o } : { label: o.label, value: o.value }
            );
          }
        });

        // Fetch distinct values for remaining fields
        const remaining = fields.filter((f: any) => !optionsMap[f.id]);
        await Promise.all(
          remaining.map(async (f: any) => {
            try {
              if (f.isCustom && f.customFieldId) {
                const { data } = await supabase
                  .from('client_custom_values')
                  .select('field_value')
                  .eq('field_id', f.customFieldId)
                  .limit(1000);
                const set = new Set<string>();
                (data || []).forEach((row: any) => {
                  const val = row.field_value;
                  if (Array.isArray(val)) {
                    val.forEach((v) => v != null && String(v).trim() && set.add(String(v)));
                  } else if (val != null && String(val).trim()) {
                    set.add(String(val));
                  }
                });
                optionsMap[f.id] = Array.from(set).sort().map((v) => ({ label: v, value: v }));
              } else if (f.dbField) {
                let query = supabase
                  .from('contacts')
                  .select(f.dbField as string)
                  .not(f.dbField as string, 'is', null)
                  .limit(1000);
                if (currentUserId) {
                  query = query.eq('user_id', currentUserId);
                }
                let { data } = await query;
                // Fallback sem filtro de usuário se não houver resultados
                if (!data || data.length === 0) {
                  const { data: fallback } = await supabase
                    .from('contacts')
                    .select(f.dbField as string)
                    .not(f.dbField as string, 'is', null)
                    .limit(1000);
                  data = fallback || [];
                }
                const set = new Set<string>();
                (data || []).forEach((row: any) => {
                  const v = row[f.dbField];
                  if (Array.isArray(v)) {
                    v.forEach((x) => x != null && String(x).trim() && set.add(String(x)));
                  } else if (v != null && String(v).trim()) {
                    set.add(String(v));
                  }
                });
                optionsMap[f.id] = Array.from(set).sort().map((v) => ({ label: v, value: v }));
              }
            } catch (e) {
              // ignore field fetch errors
              console.warn('distinct options fetch failed for field', f.id, e);
            }
          })
        );

        if (mounted) setFieldOptions(optionsMap);
      } catch (e) {
        console.error('Error loading filter options', e);
      }
    }
    loadOptions();
    return () => { mounted = false; };
  }, [fields, availableTags, responsibleHosts, stages, responsibleHostsMap]);

  const filteredMenu = useMemo(() => {
    const q = debouncedMenuSearch.trim().toLowerCase();
    if (!q) return LEFT_MENU;
    return LEFT_MENU.filter((item) => item.label.toLowerCase().includes(q));
  }, [debouncedMenuSearch]);

  const clearSection = (sectionKey: string) => {
    const section = allSections.find((s) => s.key === sectionKey);
    if (!section) return;
    setActiveMap((prev) => {
      const next = { ...prev } as Record<string, boolean>;
      section.fields.forEach((f) => { next[f.key] = false; });
      return next;
    });
    setValues((prev) => {
      const next = { ...prev } as Record<string, any[]>;
      section.fields.forEach((f) => { next[f.key] = []; });
      return next;
    });
  };

  const clearAll = () => {
    setActiveMap({});
    setValues({});
    setStatusFilter("all");
    setSegmentFilter("all");
    setLastContactFilter("all");
    window.dispatchEvent(new CustomEvent('conversations-clear-advanced-filter'));
  };

  const applyNow = () => {
    const rules: any[] = [];
    allSections.forEach((section) => {
      section.fields.forEach((f) => {
        const raw = values[f.key];
        const arr: string[] = Array.isArray(raw)
          ? raw
          : raw != null && String(raw).trim() !== ""
            ? [String(raw)]
            : [];
        if (activeMap[f.key] && arr.length > 0) {
          // Para campos personalizados (id iniciado por custom:), gerar regras unitárias (equals)
          if (String(f.key).startsWith('custom:')) {
            arr.forEach((val) => {
              rules.push({ id: `rule-${f.key}-${val}`, field: f.key, operator: 'equals', value: String(val) });
            });
          } else {
            const arrayField = f.key === "tags" || f.key === "responsible_hosts";
            const operator = arrayField ? "contains_any" : "in";
            rules.push({ id: `rule-${f.key}`, field: f.key, operator, value: arr });
          }
        }
      });
    });

    // Atualizar selectedTags a partir da coluna direita (tags marcadas)
    const selectedTags: string[] = Object.keys(activeMap)
      .filter((k) => k.startsWith('tag:') && activeMap[k])
      .map((k) => String(values[k] || '').trim())
      .filter((v) => v.length > 0);
    if (typeof filters.setSelectedTags === 'function') {
      filters.setSelectedTags(selectedTags);
    }

    const group = { id: `group-top-panel`, condition: "AND", rules };
    window.dispatchEvent(new CustomEvent('conversations-apply-advanced-filter', { detail: group }));
    // Fechar painel após aplicar
    onClose();
  };

  // Atualiza chips selecionados a cada mudança (inclui campos personalizados e tags)
  useEffect(() => {
    const chips: { key: string; label: string }[] = [];
    allSections.forEach((section) => {
      section.fields.forEach((f) => {
        const raw = values[f.key];
        const arr: string[] = Array.isArray(raw)
          ? raw
          : raw != null && String(raw).trim() !== ""
            ? [String(raw)]
            : [];
        if (activeMap[f.key] && arr.length > 0) {
          chips.push({ key: f.key, label: `${f.placeholder}: ${arr.join(', ')}` });
        }
      });
    });
    // Incluir chips de etiquetas marcadas na coluna direita
    Object.keys(activeMap)
      .filter((k) => k.startsWith('tag:') && activeMap[k])
      .forEach((k) => {
        const tagVal = values[k];
        if (tagVal && String(tagVal).trim()) {
          chips.push({ key: k, label: `Tag: ${String(tagVal)}` });
        }
      });
    setSelectedChips(chips);
  }, [activeMap, values, allSections]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="p-0 h-[90vh] overflow-hidden" aria-label="Painel de filtros de conversas">
        <div className="mx-auto w-full max-w-7xl h-full bg-background">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b bg-muted/30 gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">Filtros de Conversas</span>
              <span className="h-5 w-px bg-border" />
              <span className="text-sm text-muted-foreground">Filtros avançados para conversas e clientes</span>
            </div>
            <div className="sm:w-[350px] w-full">
              <Input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Buscar filtros e campos..."
                className="h-10"
              />
            </div>
          </div>

          {/* Chips selecionados */}
          {selectedChips.length > 0 && (
            <div className="px-6 py-3 flex flex-wrap gap-2 border-b bg-background">
              {selectedChips.map((chip) => (
                <span key={chip.key} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {chip.label}
                  <button
                    aria-label={`Remover ${chip.label}`}
                    onClick={() => {
                      setActiveMap((m) => ({ ...m, [chip.key]: false }));
                      setValues((v) => ({ ...v, [chip.key]: Array.isArray(v[chip.key]) ? [] : "" }));
                    }}
                    className="ml-1 hover:text-primary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-12 gap-0 h-[calc(100%-140px)]">
            {/* Left column: Quick Filters */}
            <div className="col-span-3 border-r bg-muted/20 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Filtros Rápidos</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">
                        Status da Conversa
                      </Label>
                      <Select
                        value={filters.statusFilter}
                        onValueChange={filters.setStatusFilter}
                      >
                        <SelectTrigger id="status-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border border-border shadow-md">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="unread-filter" className="text-xs font-medium text-muted-foreground">
                        Mensagens Não Lidas
                      </Label>
                      <Select
                        value={filters.unreadFilter}
                        onValueChange={filters.setUnreadFilter}
                      >
                        <SelectTrigger id="unread-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border border-border shadow-md">
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="unread">Não lidas</SelectItem>
                          <SelectItem value="read">Lidas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="last-message-filter" className="text-xs font-medium text-muted-foreground">
                        Última Mensagem
                      </Label>
                      <Select
                        value={filters.lastMessageFilter}
                        onValueChange={filters.setLastMessageFilter}
                      >
                        <SelectTrigger id="last-message-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border border-border shadow-md">
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="recent">Últimas 24h</SelectItem>
                          <SelectItem value="older">Mais antigas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="client-type-filter" className="text-xs font-medium text-muted-foreground">
                        Tipo de Cliente
                      </Label>
                      <Select
                        value={filters.clientTypeFilter}
                        onValueChange={filters.setClientTypeFilter}
                      >
                        <SelectTrigger id="client-type-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border border-border shadow-md">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Pequena empresa">Pequena empresa</SelectItem>
                          <SelectItem value="Média empresa">Média empresa</SelectItem>
                          <SelectItem value="Grande empresa">Grande empresa</SelectItem>
                          <SelectItem value="Pessoa física">Pessoa física</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="segment-filter" className="text-xs font-medium text-muted-foreground">
                        Etapa do Pipeline
                      </Label>
                      <Select
                        value={filters.segmentFilter}
                        onValueChange={filters.setSegmentFilter}
                      >
                        <SelectTrigger id="segment-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todas as etapas" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border border-border shadow-md">
                          <SelectItem value="all">Todas as etapas</SelectItem>
                          {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="last-contact-filter" className="text-xs font-medium text-muted-foreground">
                        Último Contato
                      </Label>
                      <Select
                        value={filters.lastContactFilter}
                        onValueChange={filters.setLastContactFilter}
                      >
                        <SelectTrigger id="last-contact-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todos os períodos" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background border border-border shadow-md">
                          <SelectItem value="all">Todos os períodos</SelectItem>
                          <SelectItem value="today">Hoje</SelectItem>
                          <SelectItem value="yesterday">Ontem</SelectItem>
                          <SelectItem value="this-week">Esta semana</SelectItem>
                          <SelectItem value="last-week">Semana passada</SelectItem>
                          <SelectItem value="this-month">Este mês</SelectItem>
                          <SelectItem value="last-month">Mês passado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Filtros salvos rápidos */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Filtros Salvos</h3>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {filteredMenu.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer group">
                          <span className="text-xs flex-1">{item.label}</span>
                          {item.editable && (
                            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Middle column: Advanced Fields with ScrollArea */}
            <div className="col-span-6 p-4 bg-background">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {allSections.map((section) => (
                    <div key={section.key} className="space-y-3">
                      <div 
                        className="flex items-center justify-between cursor-pointer hover:bg-muted/50 px-3 py-2 rounded-md transition-colors"
                        onClick={() => setCollapsed(c => ({ ...c, [section.key]: !c[section.key] }))}
                      >
                        <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSection(section.key);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:bg-muted/50 transition-colors"
                          >
                            Limpar
                          </button>
                          <ChevronDown 
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              collapsed[section.key] ? "-rotate-90" : ""
                            }`} 
                          />
                        </div>
                      </div>

                      {!collapsed[section.key] && (
                        <div className="space-y-3 pl-3">
                          {section.fields.map((field) => (
                            <FieldRow
                              key={field.key}
                              active={Boolean(activeMap[field.key])}
                              onToggle={(active) => setActiveMap(m => ({ ...m, [field.key]: active }))}
                              control={
                                <ReactSelect
                                  placeholder={field.placeholder}
                                  isMulti
                                  value={Array.isArray(values[field.key]) ? 
                                    values[field.key].map((v: any) => ({ label: v, value: v })) : 
                                    []
                                  }
                                  onChange={(selected) => {
                                    const next = (selected as any[])?.map((s: any) => s.value) || [];
                                    setValues(v => ({
                                      ...v,
                                      [field.key]: next
                                    }));
                                    setActiveMap(m => ({
                                      ...m,
                                      [field.key]: next.length > 0
                                    }));
                                  }}
                                  options={fieldOptions[field.key] || []}
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      minHeight: '32px',
                                      height: '32px',
                                      fontSize: '13px',
                                      borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                                      backgroundColor: 'hsl(var(--background))',
                                      boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--primary))' : 'none',
                                      '&:hover': {
                                        borderColor: 'hsl(var(--primary))',
                                      },
                                    }),
                                    valueContainer: (provided) => ({
                                      ...provided,
                                      height: '32px',
                                      padding: '0 6px',
                                    }),
                                    input: (provided) => ({
                                      ...provided,
                                      margin: '0px',
                                      color: 'hsl(var(--foreground))',
                                    }),
                                    indicatorsContainer: (provided) => ({
                                      ...provided,
                                      height: '32px',
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      fontSize: '13px',
                                      backgroundColor: state.isSelected 
                                        ? 'hsl(var(--primary))' 
                                        : state.isFocused 
                                          ? 'hsl(var(--muted))' 
                                          : 'hsl(var(--background))',
                                      color: state.isSelected 
                                        ? 'hsl(var(--primary-foreground))' 
                                        : 'hsl(var(--foreground))',
                                      '&:hover': {
                                        backgroundColor: state.isSelected 
                                          ? 'hsl(var(--primary))' 
                                          : 'hsl(var(--muted))',
                                      },
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      backgroundColor: 'hsl(var(--background))',
                                      border: '1px solid hsl(var(--border))',
                                      boxShadow: '0 4px 6px -1px hsl(var(--foreground) / 0.1), 0 2px 4px -1px hsl(var(--foreground) / 0.06)',
                                    }),
                                    multiValue: (provided) => ({
                                      ...provided,
                                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                                      border: '1px solid hsl(var(--primary) / 0.2)',
                                    }),
                                    multiValueLabel: (provided) => ({
                                      ...provided,
                                      color: 'hsl(var(--primary))',
                                      fontSize: '12px',
                                    }),
                                    multiValueRemove: (provided) => ({
                                      ...provided,
                                      color: 'hsl(var(--primary))',
                                      '&:hover': {
                                        backgroundColor: 'hsl(var(--primary) / 0.2)',
                                        color: 'hsl(var(--primary))',
                                      },
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: 'hsl(var(--muted-foreground))',
                                    }),
                                  }}
                                />
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right column: Tags */}
            <div className="col-span-3 border-l bg-muted/20 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Etiquetas</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {(availableTags || []).map((tag: string) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`tag-${tag}`}
                          checked={Boolean(activeMap[`tag:${tag}`])}
                          onCheckedChange={(checked) => {
                            const tagKey = `tag:${tag}`;
                            setActiveMap(m => ({ ...m, [tagKey]: Boolean(checked) }));
                            setValues(v => ({ ...v, [tagKey]: checked ? tag : "" }));
                          }}
                          className="h-4 w-4 rounded-[3px] border-gray-300 data-[state=checked]:bg-primary"
                        />
                        <Label 
                          htmlFor={`tag-${tag}`} 
                          className="text-sm font-normal text-foreground cursor-pointer flex items-center gap-2"
                        >
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Action buttons at bottom */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={clearAll}
                  className="w-full px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-md hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  Limpar Tudo
                </button>
                <button
                  onClick={applyNow}
                  className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};