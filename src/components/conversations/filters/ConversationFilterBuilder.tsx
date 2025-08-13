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

// LEFT MENU com filtros pré-configurados para conversas
const LEFT_MENU = [
  { label: "Conversas não lidas", editable: true },
  { label: "Minhas conversas", editable: true },
  { label: "Conversas recentes", editable: true },
  { label: "Conversas arquivadas", editable: true },
  { label: "Clientes ativos", editable: true },
];

// Estrutura de seção e campos para conversas
type SectionDef = {
  title: string;
  key: string;
  fields: { key: string; placeholder: string }[];
};

// SEÇÕES ESTÁTICAS para conversas
const STATIC_SECTIONS: SectionDef[] = [
  { title: "CONVERSA", key: "conversa", fields: [
    { key: "unread", placeholder: "Status de leitura" },
    { key: "lastMessage", placeholder: "Última mensagem" },
    { key: "sessionId", placeholder: "ID da sessão" },
  ] },
  { title: "CLIENTE", key: "cliente", fields: [
    { key: "clientName", placeholder: "Nome do cliente" },
    { key: "clientEmail", placeholder: "Email do cliente" },
    { key: "clientPhone", placeholder: "Telefone do cliente" },
    { key: "clientType", placeholder: "Tipo de cliente" },
    { key: "clientStatus", placeholder: "Status do cliente" },
  ] },
  { title: "TEMPORAL", key: "temporal", fields: [
    { key: "lastContact", placeholder: "Último contato" },
    { key: "createdAt", placeholder: "Data de criação" },
    { key: "updatedAt", placeholder: "Última atualização" },
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
  
  const debouncedMenuSearch = useDebounce(menuSearch, 250);
  const [selectedChips, setSelectedChips] = useState<{ key: string; label: string }[]>([]);
  const [fieldOptions, setFieldOptions] = useState<Record<string, { label: string; value: string }[]>>({});

  const allSections: SectionDef[] = useMemo(() => {
    return [...STATIC_SECTIONS];
  }, []);

  // Garantir estado de colapso para todas as seções
  useEffect(() => {
    setCollapsed((prev) => {
      const next: Record<string, boolean> = { ...prev };
      allSections.forEach((s) => {
        if (typeof next[s.key] === "undefined") next[s.key] = false;
      });
      return next;
    });
  }, [allSections]);

  // Configurar opções predefinidas para campos de conversa
  useEffect(() => {
    const optionsMap: Record<string, { label: string; value: string }[]> = {
      unread: [
        { label: "Todas", value: "all" },
        { label: "Não lidas", value: "unread" },
        { label: "Lidas", value: "read" },
      ],
      lastMessage: [
        { label: "Todas", value: "all" },
        { label: "Últimas 24h", value: "recent" },
        { label: "Mais antigas", value: "older" },
      ],
      clientType: [
        { label: "Todos", value: "all" },
        { label: "Pequena empresa", value: "Pequena empresa" },
        { label: "Média empresa", value: "Média empresa" },
        { label: "Grande empresa", value: "Grande empresa" },
        { label: "Pessoa física", value: "Pessoa física" },
      ],
      clientStatus: [
        { label: "Todos", value: "all" },
        { label: "Ativo", value: "active" },
        { label: "Inativo", value: "inactive" },
      ],
      lastContact: [
        { label: "Qualquer período", value: "all" },
        { label: "Hoje", value: "today" },
        { label: "Esta semana", value: "week" },
        { label: "Este mês", value: "month" },
      ],
    };
    setFieldOptions(optionsMap);
  }, []);

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
    filters.clearAll();
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
          const arrayField = f.key === "tags" || f.key === "responsible_hosts";
          const operator = arrayField ? "contains_any" : "in";
          rules.push({ id: `rule-${f.key}`, field: f.key, operator, value: arr });
        }
      });
    });
    const group = { id: `group-top-panel`, condition: "AND", rules };
    window.dispatchEvent(new CustomEvent('conversations-apply-advanced-filter', { detail: group }));
  };

  // Atualiza chips selecionados a cada mudança
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
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="unread">Não lidas</SelectItem>
                          <SelectItem value="read">Lidas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message-filter" className="text-xs font-medium text-muted-foreground">
                        Última Mensagem
                      </Label>
                      <Select
                        value={filters.lastMessageFilter}
                        onValueChange={filters.setLastMessageFilter}
                      >
                        <SelectTrigger id="message-filter" className="h-8 mt-1">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Pequena empresa">Pequena empresa</SelectItem>
                          <SelectItem value="Média empresa">Média empresa</SelectItem>
                          <SelectItem value="Grande empresa">Grande empresa</SelectItem>
                          <SelectItem value="Pessoa física">Pessoa física</SelectItem>
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

            {/* Middle column: Advanced Filters */}
            <div className="col-span-6 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Filtros Avançados</h3>
                  
                  {allSections.map((section) => (
                    <div key={section.key} className="border rounded-lg bg-card">
                      <div
                        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => setCollapsed((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                      >
                        <span className="text-xs font-medium text-foreground">{section.title}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSection(section.key);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Limpar
                          </button>
                          <ChevronDown className={`h-4 w-4 transition-transform ${collapsed[section.key] ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {!collapsed[section.key] && (
                        <div className="p-3 space-y-3">
                          {section.fields.map((field) => (
                            <FieldRow
                              key={field.key}
                              active={activeMap[field.key] || false}
                              onToggle={(active: boolean) => setActiveMap((prev) => ({ ...prev, [field.key]: active }))}
                              control={
                                <div className="space-y-1">
                                  <Label className="text-xs text-muted-foreground">{field.placeholder}</Label>
                                  {fieldOptions[field.key] ? (
                                    <ReactSelect
                                      isMulti
                                      value={(values[field.key] || []).map((v: string) => ({ label: v, value: v }))}
                                      onChange={(selected) => {
                                        setValues((prev) => ({
                                          ...prev,
                                          [field.key]: selected ? selected.map((s: any) => s.value) : [],
                                        }));
                                      }}
                                      options={fieldOptions[field.key] || []}
                                      placeholder={`Selecionar ${field.placeholder.toLowerCase()}`}
                                      className="text-xs"
                                      classNamePrefix="react-select"
                                      styles={{
                                        control: (base) => ({ ...base, minHeight: '28px', fontSize: '12px' }),
                                        menu: (base) => ({ ...base, fontSize: '12px' }),
                                      }}
                                    />
                                  ) : (
                                    <Input
                                      value={values[field.key] || ""}
                                      onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                      placeholder={field.placeholder}
                                      className="h-7 text-xs"
                                    />
                                  )}
                                </div>
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

            {/* Right column: Action Buttons */}
            <div className="col-span-3 border-l bg-muted/20 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <button
                    onClick={applyNow}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                  >
                    Aplicar Filtros
                  </button>
                  <button
                    onClick={clearAll}
                    className="w-full px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted/50"
                  >
                    Limpar Todos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};