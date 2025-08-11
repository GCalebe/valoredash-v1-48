import { useMemo, useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
// button removido (não usado)
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// select removido (não usado neste layout)
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, ChevronDown, Pencil, X } from "lucide-react";
import { useFilterableFields } from "@/hooks/useFilterableFields";
import { useDebounce } from "@/hooks/utils/useDebounce";

// LEFT MENU com ícone de lápis nos filtros pré-configurados
const LEFT_MENU = [
  { label: "Leads ativos", editable: true },
  { label: "Minhas pistas", editable: true },
  { label: "Ganhou leads", editable: true },
  { label: "Leads perdidos", editable: true },
  { label: "Leads com tarefas atrasadas", editable: true },
];

// Estrutura SECTIONS recuperada do histórico anterior
const SECTIONS = [
  { title: "PRINCIPAL", key: "principal", fields: [
    { type: "text", key: "name", placeholder: "Nome do cliente" },
    { type: "text", key: "email", placeholder: "E-mail" },
    { type: "text", key: "phone", placeholder: "Telefone" },
  ] },
  { title: "UTM", key: "utm", fields: [
    { type: "text", key: "utm_source", placeholder: "utm_source" },
    { type: "text", key: "utm_medium", placeholder: "utm_medium" },
    { type: "text", key: "utm_campaign", placeholder: "utm_campaign" },
  ] },
  { title: "MÍDIA", key: "midia", fields: [
    { type: "text", key: "ad_platform", placeholder: "Plataforma de mídia" },
    { type: "text", key: "adset", placeholder: "Conjunto/Grupo de anúncios" },
  ] },
  { title: "PRODUTOS", key: "produtos", fields: [
    { type: "text", key: "product", placeholder: "Produto" },
    { type: "text", key: "budget", placeholder: "Orçamento" },
  ] },
];

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
  const [values, setValues] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(Object.fromEntries(SECTIONS.map((s) => [s.key, false])) as Record<string, boolean>);
  const [menuSearch, setMenuSearch] = useState("");
  const debouncedMenuSearch = useDebounce(menuSearch, 250);
  const { availableTags } = useFilterableFields();
  const [selectedChips, setSelectedChips] = useState<{ key: string; label: string }[]>([]);

  const filteredMenu = useMemo(() => {
    const q = debouncedMenuSearch.trim().toLowerCase();
    if (!q) return LEFT_MENU;
    return LEFT_MENU.filter((item) => item.label.toLowerCase().includes(q));
  }, [debouncedMenuSearch]);

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
    window.dispatchEvent(new CustomEvent('clients-clear-advanced-filter'));
  };

  const applyNow = () => {
    const rules: any[] = [];
    SECTIONS.forEach((section) => {
      section.fields.forEach((f) => {
        const v = values[f.key];
        if (activeMap[f.key] && v && String(v).trim() !== "") {
          rules.push({ id: `rule-${f.key}`, field: f.key, operator: "contains", value: v });
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
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <select className="w-full h-8 px-2 rounded-md border bg-background text-sm">
                        <option value="all">Todos</option>
                        <option value="ativo">Ativo</option>
                        <option value="pausado">Pausado</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Segmento</label>
                      <select className="w-full h-8 px-2 rounded-md border bg-background text-sm">
                        <option value="all">Todos</option>
                        <option value="premium">Premium</option>
                        <option value="standard">Standard</option>
                        <option value="basic">Básico</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Último Contato</label>
                      <select className="w-full h-8 px-2 rounded-md border bg-background text-sm">
                        <option value="all">Todos</option>
                        <option value="today">Hoje</option>
                        <option value="week">Esta semana</option>
                        <option value="month">Este mês</option>
                      </select>
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
