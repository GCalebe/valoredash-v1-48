// @ts-nocheck
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, X } from "lucide-react";
import CustomFieldRenderer from "@/components/clients/CustomFieldRenderer";

interface FieldItem {
  id: string;
  name: string;
  type: string;
  options: string[];
  value?: string | string[] | null;
}

interface ContactTabsProps {
  getFieldsForTab: (tab: string) => FieldItem[];
  onAddField: (tab: "basico" | "comercial" | "utm" | "midia") => void;
  onEditField: (id: string, name: string, type: string, options: string[] | null) => void;
  onDeleteField: (id: string, name: string) => void;
  onUpdateField: (id: string, value: string | string[]) => void;
}

export const ContactTabs: React.FC<ContactTabsProps> = ({ getFieldsForTab, onAddField, onEditField, onDeleteField, onUpdateField }) => {
  return (
    <div className="flex-1 p-4">
      <Tabs defaultValue="basico" className="h-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="basico" className="text-xs">Básico</TabsTrigger>
          <TabsTrigger value="comercial" className="text-xs">Comercial</TabsTrigger>
          <TabsTrigger value="utm" className="text-xs">UTM</TabsTrigger>
          <TabsTrigger value="midia" className="text-xs">Mídia</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100%-60px)]">
          <TabsContent value="basico" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Informações Básicas</h4>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAddField("basico")}>
                  <Plus className="w-3 h-3 mr-1" />Campo
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nome completo</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input placeholder="email@exemplo.com" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Data de nascimento</label>
                  <Input type="date" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Gênero</label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Masculino</SelectItem>
                      <SelectItem value="f">Feminino</SelectItem>
                      <SelectItem value="o">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {getFieldsForTab("basico").map((field) => (
                  <div key={field.id} className="relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1"></div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600" onClick={() => onEditField(field.id, field.name, field.type, field.options)}>
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600" onClick={() => onDeleteField(field.id, field.name)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CustomFieldRenderer
                      field={{ id: field.id, field_name: field.name, field_type: field.type as any, field_options: field.options, is_required: false, created_at: "", updated_at: "" }}
                      value={field.value as any}
                      onChange={(value) => onUpdateField(field.id, value as any)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {(["comercial", "utm", "midia"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{tab === 'comercial' ? 'Informações Comerciais' : tab === 'utm' ? 'Parâmetros UTM' : 'Mídia Compartilhada'}</h4>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAddField(tab)}>
                    <Plus className="w-3 h-3 mr-1" />Campo
                  </Button>
                </div>
                <div className={tab === 'midia' ? 'grid grid-cols-6 gap-1' : 'space-y-3'}>
                  {tab === 'midia' && Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-sm flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer text-xs">
                      <div className="w-3 h-3 bg-primary/20 rounded"></div>
                    </div>
                  ))}
                </div>
                {getFieldsForTab(tab).map((field) => (
                  <div key={field.id} className="relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1"></div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600" onClick={() => onEditField(field.id, field.name, field.type, field.options)}>
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600" onClick={() => onDeleteField(field.id, field.name)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CustomFieldRenderer
                      field={{ id: field.id, field_name: field.name, field_type: field.type as any, field_options: field.options, is_required: false, created_at: "", updated_at: "" }}
                      value={field.value as any}
                      onChange={(value) => onUpdateField(field.id, value as any)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default ContactTabs;


