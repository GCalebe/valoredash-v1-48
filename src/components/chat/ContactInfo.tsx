import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MessageCircle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AddCustomFieldDialog from "./AddCustomFieldDialog";
import CustomFieldRenderer from "../clients/CustomFieldRenderer";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { CustomField } from "@/types/customFields";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
  status?: "online" | "away" | "offline";
  phone?: string;
  email?: string;
  sessionId?: string;
}

interface ContactInfoProps {
  contact: Contact;
  getStatusColor: (status?: string) => string;
  width: number;
}

export default function ContactInfo({ contact, getStatusColor, width }: ContactInfoProps) {
  const [tags, setTags] = useState<{id: string; label: string; color: string}[]>([
    { id: "1", label: "VIP", color: "bg-purple-500" },
    { id: "2", label: "Cliente", color: "bg-green-500" }
  ]);
  const [newTag, setNewTag] = useState("");
  const [customFields, setCustomFields] = useState<{[key: string]: any}>({});
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"basico" | "comercial" | "utm" | "midia">("basico");
  
  // Hooks para campos customizados
  const { customFields: allCustomFields, fetchCustomFields } = useCustomFields();
  const { dynamicFields, updateField, refetch } = useDynamicFields(contact.id);

  // Função para lidar com a adição de novos campos
  const handleFieldAdded = () => {
    refetch();
    fetchCustomFields();
  };

  // Função para abrir o diálogo de adicionar campo
  const handleAddField = (tab: "basico" | "comercial" | "utm" | "midia") => {
    setSelectedTab(tab);
    setAddFieldDialogOpen(true);
  };

  // Função para filtrar campos por categoria/aba
  const getFieldsForTab = (tab: string) => {
    switch (tab) {
      case "basico":
        return dynamicFields.basic || [];
      case "comercial":
        return dynamicFields.commercial || [];
      case "utm":
        return dynamicFields.personalized || []; // UTM pode usar personalized
      case "midia":
        return dynamicFields.documents || [];
      default:
        return [];
    }
  };

  return (
    <div className="border-l border-border bg-background flex flex-col" style={{ width: `${width}px` }}>
      {/* Contact Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={contact.avatar} alt={contact.name} />
              <AvatarFallback className="text-lg">{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
              getStatusColor(contact.status)
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{contact.name}</h3>
            <p className="text-sm text-muted-foreground capitalize mb-2">
              {contact.isOnline ? contact.status : 'offline'}
            </p>
            
            {/* Contact Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">@{contact.name.toLowerCase().replace(' ', '_')}</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="mt-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag.id} className={cn("text-xs px-2 py-0.5 text-white", tag.color)}>
                    {tag.label}
                    <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t.id !== tag.id))} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  placeholder="Nova tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="h-6 text-xs"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                      setTags([...tags, { 
                        id: Date.now().toString(), 
                        label: newTag.trim(), 
                        color: colors[Math.floor(Math.random() * colors.length)] 
                      }]);
                      setNewTag('');
                    }
                  }}
                />
                <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => {
                  if (newTag.trim()) {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                    setTags([...tags, { 
                      id: Date.now().toString(), 
                      label: newTag.trim(), 
                      color: colors[Math.floor(Math.random() * colors.length)] 
                    }]);
                    setNewTag('');
                  }
                }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="basico" className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="basico" className="text-xs">Básico</TabsTrigger>
            <TabsTrigger value="comercial" className="text-xs">Comercial</TabsTrigger>
            <TabsTrigger value="utm" className="text-xs">UTM</TabsTrigger>
            <TabsTrigger value="midia" className="text-xs">Mídia</TabsTrigger>
          </TabsList>

          <AddCustomFieldDialog
            isOpen={addFieldDialogOpen}
            onClose={() => setAddFieldDialogOpen(false)}
            targetTab={selectedTab}
            onFieldAdded={handleFieldAdded}
          />

          <ScrollArea className="h-[calc(100%-60px)]">
            <TabsContent value="basico" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Informações Básicas</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => handleAddField("basico")}
                  >
                    <Plus className="w-3 h-3 mr-1" />Campo
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Nome completo</label>
                    <Input defaultValue={contact.name} className="h-8 text-sm" />
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
                  <div>
                    <label className="text-xs text-muted-foreground">Anotações</label>
                    <textarea 
                      placeholder="Adicione anotações sobre o contato..."
                      className="w-full h-20 px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  
                  {/* Campos Customizados */}
                  {getFieldsForTab("basico").map((field) => (
                    <div key={field.id}>
                      <label className="text-xs text-muted-foreground">{field.name}</label>
                      <CustomFieldRenderer
                        field={{
                          id: field.id,
                          field_name: field.name,
                          field_type: field.type as "text" | "single_select" | "multi_select",
                          field_options: field.options,
                          is_required: false,
                          created_at: "",
                          updated_at: ""
                        }}
                        value={field.value}
                        onChange={(value) => updateField(field.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comercial" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Informações Comerciais</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => handleAddField("comercial")}
                  >
                    <Plus className="w-3 h-3 mr-1" />Campo
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Status do lead</label>
                    <Select>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="qualificado">Qualificado</SelectItem>
                        <SelectItem value="oportunidade">Oportunidade</SelectItem>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="perdido">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Fonte de aquisição</label>
                    <Input placeholder="Google Ads, Facebook, etc." className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Valor do negócio</label>
                    <Input placeholder="R$ 0,00" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Empresa</label>
                    <Input placeholder="Nome da empresa" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Cargo</label>
                    <Input placeholder="Posição na empresa" className="h-8 text-sm" />
                  </div>
                  
                  {/* Campos Customizados */}
                  {getFieldsForTab("comercial").map((field) => (
                    <div key={field.id}>
                      <label className="text-xs text-muted-foreground">{field.name}</label>
                      <CustomFieldRenderer
                        field={{
                          id: field.id,
                          field_name: field.name,
                          field_type: field.type as "text" | "single_select" | "multi_select",
                          field_options: field.options,
                          is_required: false,
                          created_at: "",
                          updated_at: ""
                        }}
                        value={field.value}
                        onChange={(value) => updateField(field.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="utm" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Parâmetros UTM</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => handleAddField("utm")}
                  >
                    <Plus className="w-3 h-3 mr-1" />Campo
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">UTM Source</label>
                    <Input placeholder="google, facebook, newsletter" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">UTM Medium</label>
                    <Input placeholder="cpc, email, social" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">UTM Campaign</label>
                    <Input placeholder="nome-da-campanha" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">UTM Term</label>
                    <Input placeholder="palavra-chave" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">UTM Content</label>
                    <Input placeholder="conteudo-especifico" className="h-8 text-sm" />
                  </div>
                  
                  {/* Campos Customizados */}
                  {getFieldsForTab("utm").map((field) => (
                    <div key={field.id}>
                      <label className="text-xs text-muted-foreground">{field.name}</label>
                      <CustomFieldRenderer
                        field={{
                          id: field.id,
                          field_name: field.name,
                          field_type: field.type as "text" | "single_select" | "multi_select",
                          field_options: field.options,
                          is_required: false,
                          created_at: "",
                          updated_at: ""
                        }}
                        value={field.value}
                        onChange={(value) => updateField(field.id, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="midia" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Mídia Compartilhada</h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => handleAddField("midia")}
                  >
                    <Plus className="w-3 h-3 mr-1" />Campo
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="w-6 h-6 bg-primary/20 rounded"></div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full h-8 text-xs">
                  Ver toda a mídia
                </Button>
                
                {/* Campos Customizados */}
                {getFieldsForTab("midia").map((field) => (
                  <div key={field.id}>
                    <label className="text-xs text-muted-foreground">{field.name}</label>
                    <CustomFieldRenderer
                      field={{
                        id: field.id,
                        field_name: field.name,
                        field_type: field.type as "text" | "single_select" | "multi_select",
                        field_options: field.options,
                        is_required: false,
                        created_at: "",
                        updated_at: ""
                      }}
                      value={field.value}
                      onChange={(value) => updateField(field.id, value)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        

      </div>
    </div>
  );
}