import { useMemo, useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, ChevronDown, Pencil, X } from "lucide-react";
import { useFilterableFields } from "@/hooks/useFilterableFields";
import { useKanbanStagesLocal } from "@/hooks/useKanbanStagesLocal";
import { useDebounce } from "@/hooks/utils/useDebounce";
import ReactSelect from "react-select";
import { supabase } from "@/integrations/supabase/client";

// LEFT MENU com ícone de lápis nos filtros pré-configurados
const LEFT_MENU = [
  { label: "Leads ativos", editable: true },
  { label: "Minhas pistas", editable: true },
  { label: "Ganhou leads", editable: true },
  { label: "Leads perdidos", editable: true },
  { label: "Leads com tarefas atrasadas", editable: true },
];

// Estrutura SECTIONS alinhada ao formulário "Novo Cliente"
const SECTIONS = [
  { title: "PRINCIPAL", key: "principal", fields: [
    { type: "text", key: "name", placeholder: "Nome do cliente" },
    { type: "text", key: "email", placeholder: "E-mail" },
    { type: "text", key: "phone", placeholder: "Telefone" },
  ] },
  { title: "EMPRESA", key: "empresa", fields: [
    { type: "text", key: "client_name", placeholder: "Nome da empresa" },
    { type: "text", key: "client_type", placeholder: "Tipo de cliente" },
    { type: "text", key: "client_size", placeholder: "Porte do cliente" },
  ] },
  { title: "DOCUMENTOS", key: "documentos", fields: [
    { type: "text", key: "cpf_cnpj", placeholder: "CPF/CNPJ" },
  ] },
  { title: "FINANCEIRO", key: "financeiro", fields: [
    { type: "number", key: "budget", placeholder: "Orçamento" },
  ] },
] as const;

function FieldRow({ active, onToggle, control }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={active} onCheckedChange={(v) => onToggle(Boolean(v))} className="h-4 w-4 rounded-[3px] border-gray-300 data-[state=checked]:bg-primary" />
      <div className="flex-1">{control}</div>
    </div>
  );
}

interface SlidingFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlidingFilterPanel({ isOpen, onClose }: Readonly<SlidingFilterPanelProps>) {
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, any>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(Object.fromEntries(SECTIONS.map((s) => [s.key, false])) as Record<string, boolean>);
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

  useEffect(() => {
    let mounted = true;
    async function loadOptions() {
      try {
        const optionsMap: Record<string, { label: string; value: string }[]> = {};

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
                const { data } = await supabase
                  .from('contacts')
                  .select(f.dbField as string)
                  .not(f.dbField as string, 'is', null)
                  .limit(1000);
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

  const CATEGORY_LABELS: Record<string, string> = {
    basic: "BÁSICO",
    kanban: "KANBAN",
    commercial: "COMERCIAL",
    temporal: "TEMPORAL",
    documents: "DOCUMENTOS",
    personalized: "PERSONALIZADOS",
  };

  const groupedFields = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (fields || []).forEach((f: any) => {
      const key = f.category || 'basic';
      if (!groups[key]) groups[key] = [];
      groups[key].push(f);
    });
    return groups;
  }, [fields]);

  const clearSection = (sectionKey: string) => {
    const section = SECTIONS.find((s) => s.key === sectionKey);
    if (!section) return;
    setActiveMap((prev) => {
      const next = { ...prev } as Record<string, boolean>;
      section.fields.forEach((f) => { next[f.key] = false; });
      return next;
    });
    setValues((prev) => {
      const next = { ...prev } as Record<string, string>;
      section.fields.forEach((f) => { next[f.key] = ""; });
      return next;
    });
  };

  const clearAll = () => {
    setActiveMap({});
    setValues({});
    setStatusFilter("all");
    setSegmentFilter("all");
    setLastContactFilter("all");
    window.dispatchEvent(new CustomEvent('clients-clear-advanced-filter'));
  };

const applyNow = () => {
  const rules: any[] = [];
  SECTIONS.forEach((section) => {
    section.fields.forEach((f) => {
      const v = values[f.key];
      if (activeMap[f.key] && v && String(v).trim() !== "") {
        const operator = f.type === "number" ? "equals" : f.type === "select" ? "equals" : "contains";
        rules.push({ id: `rule-${f.key}`, field: f.key, operator, value: v });
      }
    });
  });
  const group = { id: `group-top-panel`, condition: "AND", rules };
  window.dispatchEvent(new CustomEvent('clients-apply-advanced-filter', { detail: group }));
};

  // Atualiza chips selecionados a cada mudança
  useEffect(() => {
    const chips: { key: string; label: string }[] = [];
    SECTIONS.forEach((section) => {
      section.fields.forEach((f) => {
        const v = values[f.key];
        if (activeMap[f.key] && v && String(v).trim() !== "") {
          chips.push({ key: f.key, label: `${f.placeholder}: ${v}` });
        }
      });
    });
    setSelectedChips(chips);
  }, [activeMap, values]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="p-0 h-[90vh] overflow-hidden" aria-label="Painel de filtros">
        <div className="mx-auto w-full max-w-7xl h-full bg-background">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b bg-muted/30 gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">Filtro 2</span>
              <span className="h-5 w-px bg-border" />
              <span className="text-sm text-muted-foreground">Filtros avançados e personalizados</span>
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
                      setValues((v) => ({ ...v, [chip.key]: "" }));
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
                      <Label htmlFor="pipeline-filter" className="text-xs font-medium text-muted-foreground">
                        Pipeline
                      </Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        disabled={kanbanLoading}
                      >
                        <SelectTrigger id="pipeline-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todos os estágios" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os estágios</SelectItem>
                          {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="host-filter" className="text-xs font-medium text-muted-foreground">
                        Anfitrião
                      </Label>
                      <Select
                        value={segmentFilter}
                        onValueChange={setSegmentFilter}
                        disabled={hostsLoading}
                      >
                        <SelectTrigger id="host-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todos os anfitriões" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os anfitriões</SelectItem>
                          {responsibleHosts.map((host) => (
                            <SelectItem key={host} value={host}>
                              {host}
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
                        value={lastContactFilter}
                        onValueChange={setLastContactFilter}
                      >
                        <SelectTrigger id="last-contact-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todos os períodos" />
                        </SelectTrigger>
                        <SelectContent>
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
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Filtros Predefinidos</h4>
                  <div className="space-y-1">
                    {filteredMenu.map((item, i) => (
                      <button
                        key={item.label}
                        className="group w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent rounded-md transition-colors border-l-2 border-transparent hover:border-primary/50"
                        aria-label={item.label}
                      >
                        <span className={`text-sm ${i === 0 ? "text-primary font-medium" : "text-foreground"}`}>{item.label}</span>
                        {item.editable && <Pencil className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Center: sections and fields */}
            <div className="col-span-6 border-r p-4">
              <div className="h-full">
                <h3 className="text-sm font-semibold text-foreground mb-4">Campos Personalizados</h3>
                <ScrollArea className="h-[calc(100%-2rem)]">
                  <div className="space-y-6">
                    {SECTIONS.map((section) => (
                      <div key={section.key}>
                        <div className="border-b pb-3 flex justify-between items-center">
                          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{section.title}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => clearSection(section.key)}
                              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                            >
                              Limpar
                            </button>
                            <button
                              onClick={() => setCollapsed((c) => ({ ...c, [section.key]: !c[section.key] }))}
                              className="p-0.5 hover:bg-accent rounded"
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${collapsed[section.key] ? "-rotate-90" : "rotate-0"}`}
                              />
                            </button>
                          </div>
                        </div>
                        {!collapsed[section.key] && (
                          <div className="mt-4 space-y-3">
                            {section.fields.map((f) => (
                              <FieldRow
                                key={f.key}
                                active={!!activeMap[f.key]}
                                onToggle={(v) => setActiveMap((m) => ({ ...m, [f.key]: v }))}
                                control={<Input className="h-9" placeholder={f.placeholder} value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Right: tags */}
            <div className="col-span-3 p-4 bg-muted/10">
              <div className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Etiquetas
                  </h3>
                  <button className="text-xs text-primary hover:underline">Gerenciar</button>
                </div>
                
                <div className="space-y-3">
                  <Input className="h-9" placeholder="Buscar etiquetas..." />
                  <ScrollArea className="h-[calc(100%-6rem)]">
                    <div className="space-y-2">
                      {availableTags.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhuma etiqueta disponível</p>
                      )}
                      {availableTags.map((t) => (
                        <label key={t} className="flex items-center gap-2 text-sm p-2 hover:bg-accent rounded-md transition-colors">
                          <Checkbox
                            checked={!!activeMap[`tag:${t}`]}
                            onCheckedChange={(v) => {
                              const on = Boolean(v);
                              setActiveMap((m) => ({ ...m, [`tag:${t}`]: on }));
                              setValues((vals) => ({ ...vals, [`tag:${t}`]: on ? t : "" }));
                            }}
                            className="h-4 w-4"
                          />
                          <span className="flex-1">{t}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
            <span className="text-xs text-muted-foreground">Dica: marque os campos desejados para ativar o filtro</span>
            <div className="flex items-center gap-3">
              <button onClick={clearAll} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors">Limpar Tudo</button>
              <button onClick={applyNow} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Aplicar Filtros</button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
