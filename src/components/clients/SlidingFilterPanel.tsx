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
      <SheetContent side="top" className="p-0 h-[72vh] max-h-[80vh] overflow-hidden" aria-label="Painel de filtros">
        <div className="mx-auto w-[70vw] max-w-[1100px] h-full bg-white rounded-b-md shadow">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b bg-gray-50 gap-2">
            <div className="flex items-center gap-3 flex-1">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">Leads ativos</span>
              <span className="h-5 w-px bg-gray-200" />
              <span className="text-sm text-primary">Pesquisar e filtrar</span>
            </div>
            <div className="sm:w-[320px] w-full">
              <Input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Buscar filtros…"
                className="h-9"
              />
            </div>
          </div>

          {/* Chips selecionados */}
          {selectedChips.length > 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-b bg-white">
              {selectedChips.map((chip) => (
                <span key={chip.key} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-800">
                  {chip.label}
                  <button
                    aria-label={`Remover ${chip.label}`}
                    onClick={() => {
                      setActiveMap((m) => ({ ...m, [chip.key]: false }));
                      setValues((v) => ({ ...v, [chip.key]: "" }));
                    }}
                    className="ml-1 hover:text-violet-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-12 gap-4 p-4">
            {/* Left list */}
            <Card className="col-span-3 h-[58vh] border-r-0 rounded-r-none">
              <CardContent className="pt-0">
                <ul className="space-y-1 text-sm">
                  {filteredMenu.length === 0 && (
                    <li className="text-xs text-muted-foreground px-2 py-2">Nenhum filtro encontrado</li>
                  )}
                  {filteredMenu.map((item, i) => (
                    <li
                      key={item.label}
                      className="group flex items-center justify-between px-2 py-2 hover:bg-amber-50 rounded focus:outline-none focus:ring-2 focus:ring-violet-400 border-l-2 border-transparent hover:border-amber-300"
                      aria-label={item.label}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`${i === 0 ? "text-sky-600 font-semibold" : ""}`}>{item.label}</span>
                      </div>
                      {item.editable && <button aria-label={`Editar ${item.label}`} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" /></button>}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Center: sections and fields */}
            <Card className="col-span-6 h-[58vh] rounded-none border-x">
              <CardContent className="pt-3">
                <ScrollArea className="h-[48vh] pr-2">
                  <div className="space-y-4">
                    {SECTIONS.map((section) => (
                      <div key={section.key}>
                        <div className="border-b pb-2 flex justify-between items-center">
                          <span className="text-[12px] font-semibold tracking-wider text-muted-foreground">{section.title}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => clearSection(section.key)}
                              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                            >
                              Limpar
                            </button>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${collapsed[section.key] ? "-rotate-90" : "rotate-0"}`}
                              onClick={() => setCollapsed((c) => ({ ...c, [section.key]: !c[section.key] }))}
                            />
                          </div>
                        </div>
                        {!collapsed[section.key] && (
                          <div className="mt-3 space-y-3">
                            {section.fields.map((f) => (
                              <FieldRow
                                key={f.key}
                                active={!!activeMap[f.key]}
                                onToggle={(v) => setActiveMap((m) => ({ ...m, [f.key]: v }))}
                                control={<Input className="h-8 border-gray-300" placeholder={f.placeholder} value={values[f.key] || ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right: tags */}
            <Card className="col-span-3 h-[58vh] rounded-l-none">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm tracking-wider text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" /> ETIQUETAS
                  </CardTitle>
                  <button className="text-sm text-primary hover:underline">Gerenciar</button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Dropdown pesquisável de tags (somente visual + valores do banco) */}
                <Input className="h-8 border-gray-300 mb-2" placeholder="Buscar tags…" />
                <div className="max-h-[40vh] overflow-auto border rounded p-2 space-y-1">
                  {availableTags.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                  )}
                  {availableTags.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={!!activeMap[`tag:${t}`]}
                        onCheckedChange={(v) => {
                          const on = Boolean(v);
                          setActiveMap((m) => ({ ...m, [`tag:${t}`]: on }));
                          setValues((vals) => ({ ...vals, [`tag:${t}`]: on ? t : "" }));
                        }}
                        className="h-4 w-4"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
            <span className="text-xs text-muted-foreground">Dica: marque os campos para ativar o filtro</span>
            <div className="flex items-center gap-2">
              <button onClick={clearAll} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">Limpar Tudo</button>
              <button onClick={applyNow} className="px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90">Aplicar</button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
