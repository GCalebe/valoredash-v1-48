import React, { useState, useEffect } from "react";
import { format, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EventFormData, CalendarEvent } from "@/hooks/useCalendarEvents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContactsData } from "@/hooks/useContactsData";
import { Contact } from "@/types/client";
import { X, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: EventFormData) => void;
  onDelete?: (eventId: string) => void;
  isSubmitting: boolean;
  event?: CalendarEvent;
  title: string;
  description: string;
  submitLabel: string;
}

const colors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#78716c",
];

const services = [
  "Manutenção de Casco",
  "Revisão de Motor",
  "Inspeção de Segurança",
  "Vistoria Completa",
  "Limpeza e Enceramento",
  "Manutenção Preventiva",
  "Vistoria de Segurança",
  "Consultoria Náutica",
  "Avaliação de Embarcação",
  "Instalação de Equipamentos",
  "Reparo Elétrico",
  "Reparo Hidráulico"
];

const collaborators = [
  "João Silva",
  "Maria Oliveira",
  "Pedro Santos",
  "Ana Costa",
];

const durations = [
  { label: "30 minutos", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "1 hora e 30 minutos", value: 90 },
  { label: "2 horas", value: 120 },
  { label: "3 horas", value: 180 },
  { label: "4 horas", value: 240 },
];

const attendanceTypes = [
  { label: "Presencial", value: "presencial" },
  { label: "Online", value: "online" },
];

export function EventFormDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  isSubmitting,
  event,
  title,
  description,
  submitLabel,
}: EventFormDialogProps) {
  const [activeTab, setActiveTab] = useState("client");
  const [summary, setSummary] = useState("");
  const [automation, setAutomation] = useState("");
  const [collaborator, setCollaborator] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [email, setEmail] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedService, setSelectedService] = useState(services[0]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [attendanceType, setAttendanceType] = useState("presencial");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Contact | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isBlockingDate, setIsBlockingDate] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [tags, setTags] = useState<{id: string, text: string, color: string}[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [initialStatus, setInitialStatus] = useState<"confirmado" | "pendente">("confirmado");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { contacts } = useContactsData();
  const filteredContacts = contacts.filter(
    contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to set basic event information
  const setBasicEventInfo = (event: any) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    setSummary(event.summary || "");
    setAutomation("");
    setCollaborator(event.hostName || "");
    setEventDescription(event.description || "");
    setEmail(event.attendees?.find((a) => a?.email)?.email || "");
    setStartDateTime(format(start, "yyyy-MM-dd'T'HH:mm"));
    setEndDateTime(format(end, "yyyy-MM-dd'T'HH:mm"));
    setSelectedColor(colors[0]);
    
    // Calculate duration from start and end times
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    setSelectedDuration(durationInMinutes);
  };
  
  // Helper function to find service information
  const findServiceInfo = (event: any) => {
    const foundService = services.find(service => 
      event.summary?.includes(service) || event.description?.includes(service)
    );
    setSelectedService(foundService || services[0]);
  };
  
  // Helper function to find client information
  const findClientInfo = (event: any) => {
    const clientEmail = event.attendees?.find((a) => a?.email)?.email;
    if (clientEmail) {
      const foundClient = contacts.find(c => c.email === clientEmail);
      if (foundClient) {
        setSelectedClient(foundClient);
        setIsNewClient(false);
      }
    }
  };
  
  // Helper function to determine attendance type and location/link
  const determineAttendanceInfo = (event: any) => {
    if (event.description?.toLowerCase().includes("online") || 
        event.description?.toLowerCase().includes("zoom") || 
        event.description?.toLowerCase().includes("meet")) {
      setAttendanceType("online");
      
      // Try to extract meeting link
      const linkMatch = event.description?.match(/(https?:\/\/[^\s]+)/);
      if (linkMatch) {
        setMeetingLink(linkMatch[0]);
      }
    } else {
      setAttendanceType("presencial");
      
      // Try to extract location
      const locationLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("local") || 
        line.toLowerCase().includes("endereço") ||
        line.toLowerCase().includes("localização")
      );
      if (locationLines && locationLines.length > 0) {
        setLocation(locationLines[0].replace(/local|endereço|localização/i, "").trim());
      }
    }
  };
  
  // Helper function to check if date is blocked and extract reason
  const checkBlockedDate = (event: any) => {
    if (event.summary?.toLowerCase().includes("bloqueado") || 
        event.description?.toLowerCase().includes("bloqueado")) {
      setIsBlockingDate(true);
      
      // Try to extract block reason
      const reasonLines = event.description?.split('\n').filter(line => 
        line.toLowerCase().includes("motivo") || 
        line.toLowerCase().includes("razão")
      );
      if (reasonLines && reasonLines.length > 0) {
        setBlockReason(reasonLines[0].replace(/motivo|razão/i, "").trim());
      }
    }
  };
  
  // Helper function to extract tags from description
  const extractTags = (event: any) => {
    const tagRegex = /#([a-zA-Z0-9]+)/g;
    const foundTags = event.description?.match(tagRegex);
    if (foundTags) {
      const extractedTags = foundTags.map((tag: string, index: number) => ({
        id: `tag-${index}`,
        text: tag.substring(1),
        color: colors[index % colors.length]
      }));
      setTags(extractedTags);
    }
  };
  
  // Helper function to determine initial status
  const determineInitialStatus = (event: any) => {
    if (event.status === "confirmed") {
      setInitialStatus("confirmado");
    } else if (event.status === "tentative") {
      setInitialStatus("pendente");
    }
  };
  
  // Helper function to reset form
  const resetForm = () => {
    setSummary("");
    setAutomation("");
    setCollaborator("");
    setEventDescription("");
    setEmail("");
    setStartDateTime("");
    setEndDateTime("");
    setSelectedColor(colors[0]);
    setSelectedService(services[0]);
    setSelectedDuration(60);
    setAttendanceType("presencial");
    setLocation("");
    setMeetingLink("");
    setSearchTerm("");
    setSelectedClient(null);
    setIsNewClient(false);
    setNewClientData({
      name: "",
      email: "",
      phone: "",
    });
    setActiveTab("client");
    setErrors({});
    setIsBlockingDate(false);
    setBlockReason("");
    setTags([]);
    setNewTag("");
    setNewTagColor("#3b82f6");
    setInitialStatus("confirmado");
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    if (event && open) {
      setBasicEventInfo(event);
      findServiceInfo(event);
      findClientInfo(event);
      determineAttendanceInfo(event);
      checkBlockedDate(event);
      extractTags(event);
      determineInitialStatus(event);
    } else if (!open) {
      resetForm();
    }
  }, [event, open, contacts]);

  // Helper function to validate blocked date fields
  const validateBlockedDate = (errors: Record<string, string>): Record<string, string> => {
    const newErrors = { ...errors };
    
    if (!startDateTime) {
      newErrors.startDateTime = "A data e hora de início são obrigatórias";
    }
    
    if (!blockReason.trim()) {
      newErrors.blockReason = "O motivo do bloqueio é obrigatório";
    }
    
    return newErrors;
  };
  
  // Helper function to validate client fields
  const validateClientFields = (errors: Record<string, string>): Record<string, string> => {
    const newErrors = { ...errors };
    
    if (!selectedClient && !isNewClient) {
      newErrors.client = "Selecione um cliente ou crie um novo";
    }
    
    if (isNewClient) {
      if (!newClientData.name.trim()) {
        newErrors.newClientName = "O nome do cliente é obrigatório";
      }
      if (!newClientData.phone.trim()) {
        newErrors.newClientPhone = "O telefone do cliente é obrigatório";
      }
    }
    
    return newErrors;
  };
  
  // Helper function to validate service and collaborator fields
  const validateServiceFields = (errors: Record<string, string>): Record<string, string> => {
    const newErrors = { ...errors };
    
    if (!selectedService) {
      newErrors.service = "O serviço é obrigatório";
    }
    
    if (!collaborator) {
      newErrors.collaborator = "O responsável é obrigatório";
    }
    
    return newErrors;
  };
  
  // Helper function to validate date and attendance fields
  const validateAttendanceFields = (errors: Record<string, string>): Record<string, string> => {
    const newErrors = { ...errors };
    
    if (!startDateTime) {
      newErrors.startDateTime = "A data e hora de início são obrigatórias";
    }
    
    if (attendanceType === "presencial" && !location.trim()) {
      newErrors.location = "O local é obrigatório para atendimento presencial";
    }
    
    if (attendanceType === "online" && !meetingLink.trim()) {
      newErrors.meetingLink = "O link da reunião é obrigatório para atendimento online";
    }
    
    return newErrors;
  };

  const validateForm = (): boolean => {
    let newErrors: Record<string, string> = {};
    
    if (isBlockingDate) {
      newErrors = validateBlockedDate(newErrors);
    } else {
      newErrors = validateClientFields(newErrors);
      newErrors = validateServiceFields(newErrors);
      newErrors = validateAttendanceFields(newErrors);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to create blocked date description
  const createBlockedDateDescription = (): { summary: string, description: string } => {
    const summary = `BLOQUEADO: ${blockReason}`;
    let description = `Data bloqueada\nMotivo: ${blockReason}\n`;
    
    if (tags.length > 0) {
      description += "\nTags: " + tags.map(tag => `#${tag.text}`).join(" ");
    }
    
    return { summary, description };
  };
  
  // Helper function to create client information for description
  const createClientInfoDescription = (): string => {
    let clientInfo = "";
    
    if (selectedClient) {
      clientInfo += `Cliente: ${selectedClient.name}\n`;
      clientInfo += `Telefone: ${selectedClient.phone || "Não informado"}\n`;
      if (selectedClient.email) {
        clientInfo += `Email: ${selectedClient.email}\n`;
      }
    } else if (isNewClient) {
      clientInfo += `Cliente: ${newClientData.name}\n`;
      clientInfo += `Telefone: ${newClientData.phone}\n`;
      if (newClientData.email) {
        clientInfo += `Email: ${newClientData.email}\n`;
      }
    }
    
    return clientInfo;
  };
  
  // Helper function to create attendance information for description
  const createAttendanceInfoDescription = (): string => {
    let attendanceInfo = `Tipo de Atendimento: ${attendanceType === "presencial" ? "Presencial" : "Online"}\n`;
    
    if (attendanceType === "presencial") {
      attendanceInfo += `Local: ${location}\n`;
    } else {
      attendanceInfo += `Link da Reunião: ${meetingLink}\n`;
    }
    
    return attendanceInfo;
  };
  
  // Helper function to create regular event description
  const createRegularEventDescription = (): { summary: string, description: string } => {
    let description = `Serviço: ${selectedService}\n`;
    description += `Responsável: ${collaborator}\n`;
    description += createClientInfoDescription();
    description += createAttendanceInfoDescription();
    description += `Status: ${initialStatus}\n`;
    
    if (tags.length > 0) {
      description += `\nTags: ${tags.map(tag => `#${tag.text}`).join(" ")}\n`;
    }
    
    if (eventDescription) {
      description += `\nObservações:\n${eventDescription}`;
    }
    
    // Build summary
    const clientName = selectedClient ? selectedClient.name : isNewClient ? newClientData.name : "Cliente";
    const summary = `${selectedService} - ${clientName}`;
    
    return { summary, description };
  };
  
  // Helper function to prepare form data
  const prepareFormData = (summary: string, description: string, startDate: Date, endDate: Date): EventFormData => {
    // Get email
    const clientEmail = selectedClient ? selectedClient.email : isNewClient ? newClientData.email : email;

    return {
      summary,
      description,
      email: clientEmail || "",
      date: startDate,
      startTime: format(startDate, "HH:mm"),
      endTime: format(endDate, "HH:mm"),
      hostName: collaborator,
      automation,
      colorId: selectedColor,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const startDate = startDateTime ? parse(startDateTime, "yyyy-MM-dd'T'HH:mm", new Date()) : new Date();
    const endDate = new Date(startDate.getTime() + selectedDuration * 60 * 1000);
    
    let eventInfo;
    if (isBlockingDate) {
      eventInfo = createBlockedDateDescription();
    } else {
      eventInfo = createRegularEventDescription();
    }
    
    const formData = prepareFormData(eventInfo.summary, eventInfo.description, startDate, endDate);
    onSubmit(formData);
  };

  const handleSelectClient = (contact: Contact) => {
    setSelectedClient(contact);
    setIsNewClient(false);
    setEmail(contact.email || "");
    setSearchTerm("");
    setActiveTab("service");
  };

  const handleNewClient = () => {
    setIsNewClient(true);
    setSelectedClient(null);
  };

  // Helper function to validate new client data before proceeding
  const validateNewClientData = (): boolean => {
    const hasErrors = !newClientData.name || !newClientData.phone;
    
    if (hasErrors) {
      setErrors({
        ...errors,
        newClientName: !newClientData.name ? "Nome é obrigatório" : "",
        newClientPhone: !newClientData.phone ? "Telefone é obrigatório" : "",
      });
    }
    
    return !hasErrors;
  };

  const handleSaveNewClient = () => {
    if (validateNewClientData()) {
      setEmail(newClientData.email);
      setActiveTab("service");
    }
  };

  // Helper function to validate service selection before proceeding
  const validateServiceSelection = (): boolean => {
    const serviceErrors = {
      service: !selectedService ? "Serviço é obrigatório" : "",
      collaborator: !collaborator ? "Responsável é obrigatório" : "",
    };
    
    const hasErrors = !selectedService || !collaborator;
    
    if (hasErrors) {
      setErrors({
        ...errors,
        ...serviceErrors
      });
    }
    
    return !hasErrors;
  };

  const handleServiceNext = () => {
    if (validateServiceSelection()) {
      setActiveTab("datetime");
    }
  };

  // Helper function to validate date and time selection before proceeding
  const validateDateTimeSelection = (): boolean => {
    const hasError = !startDateTime;
    
    if (hasError) {
      setErrors({
        ...errors,
        startDateTime: "Data e hora são obrigatórias",
      });
    }
    
    return !hasError;
  };

  const handleDateTimeNext = () => {
    if (validateDateTimeSelection()) {
      setActiveTab("attendance");
    }
  };

  const updateEndTime = () => {
    if (startDateTime) {
      const startDate = parse(startDateTime, "yyyy-MM-dd'T'HH:mm", new Date());
      const endDate = new Date(startDate.getTime() + selectedDuration * 60 * 1000);
      setEndDateTime(format(endDate, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      const tag = {
        id: `tag-${Date.now()}`,
        text: newTag.trim(),
        color: newTagColor
      };
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const removeTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const handleDeleteEvent = () => {
    if (event && onDelete) {
      setIsDeleteDialogOpen(false);
      onDelete(event.id);
    }
  };

  useEffect(() => {
    updateEndTime();
  }, [startDateTime, selectedDuration]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isBlockingDate ? "Bloquear Data" : title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="block-date" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="block-date"
                  type="checkbox"
                  checked={isBlockingDate}
                  onChange={(e) => setIsBlockingDate(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Bloquear data/período</span>
              </Label>
            </div>

            {isBlockingDate ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="block-startDateTime">Data e Hora de Início *</Label>
                  <Input
                    id="block-startDateTime"
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className={errors.startDateTime ? "border-destructive" : ""}
                  />
                  {errors.startDateTime && (
                    <p className="text-sm text-destructive">{errors.startDateTime}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="block-endDateTime">Data e Hora de Término</Label>
                  <Input
                    id="block-endDateTime"
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="block-reason">Motivo do Bloqueio *</Label>
                  <Input
                    id="block-reason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ex: Feriado, Manutenção, etc."
                    className={errors.blockReason ? "border-destructive" : ""}
                  />
                  {errors.blockReason && (
                    <p className="text-sm text-destructive">{errors.blockReason}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Cor do Evento</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        type="button"
                        key={color}
                        className={cn(
                          "h-8 w-8 rounded-full cursor-pointer transition-transform transform hover:scale-110",
                          selectedColor === color &&
                            "ring-2 ring-offset-2 ring-primary",
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags Personalizadas</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        style={{backgroundColor: tag.color}}
                        className="text-white flex items-center gap-1"
                      >
                        {tag.text}
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag.id)}
                          className="ml-1 hover:bg-white/20 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Nova tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                    </div>
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="block-notes">Observações (opcional)</Label>
                  <Textarea
                    id="block-notes"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Observações adicionais sobre o bloqueio..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="client">1. Cliente</TabsTrigger>
                  <TabsTrigger value="service">2. Serviço</TabsTrigger>
                  <TabsTrigger value="datetime">3. Data/Hora</TabsTrigger>
                  <TabsTrigger value="attendance">4. Atendimento</TabsTrigger>
                </TabsList>
                
                {/* Step 1: Client Selection */}
                <TabsContent value="client" className="space-y-4 py-4">
                  {!isNewClient ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="client-search">Buscar Cliente</Label>
                        <Input
                          id="client-search"
                          placeholder="Digite nome, email ou telefone"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={errors.client ? "border-destructive" : ""}
                        />
                        {errors.client && (
                          <p className="text-sm text-destructive">{errors.client}</p>
                        )}
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        {filteredContacts.length > 0 ? (
                          <div className="divide-y">
                            {filteredContacts.map((contact) => (
                              <div 
                                key={contact.id}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                onClick={() => handleSelectClient(contact)}
                              >
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {contact.phone}
                                  {contact.email && ` • ${contact.email}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchTerm ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Nenhum cliente encontrado
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Digite para buscar clientes
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button type="button" variant="outline" onClick={handleNewClient}>
                          + Novo Cliente
                        </Button>
                        
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("service")}
                          disabled={!selectedClient}
                        >
                          Próximo
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-client-name">Nome do Cliente *</Label>
                          <Input
                            id="new-client-name"
                            value={newClientData.name}
                            onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                            className={errors.newClientName ? "border-destructive" : ""}
                          />
                          {errors.newClientName && (
                            <p className="text-sm text-destructive">{errors.newClientName}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-client-email">Email</Label>
                          <Input
                            id="new-client-email"
                            type="email"
                            value={newClientData.email}
                            onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-client-phone">Telefone *</Label>
                          <Input
                            id="new-client-phone"
                            value={newClientData.phone}
                            onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                            className={errors.newClientPhone ? "border-destructive" : ""}
                          />
                          {errors.newClientPhone && (
                            <p className="text-sm text-destructive">{errors.newClientPhone}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsNewClient(false);
                            setNewClientData({name: "", email: "", phone: ""});
                          }}
                        >
                          Voltar
                        </Button>
                        
                        <Button 
                          type="button" 
                          onClick={handleSaveNewClient}
                        >
                          Próximo
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                {/* Step 2: Service Selection */}
                <TabsContent value="service" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço Náutico *</Label>
                    <Select 
                      value={selectedService} 
                      onValueChange={setSelectedService}
                    >
                      <SelectTrigger id="service" className={errors.service ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.service && (
                      <p className="text-sm text-destructive">{errors.service}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="collaborator">Responsável / Atendente *</Label>
                    <Select 
                      value={collaborator} 
                      onValueChange={setCollaborator}
                    >
                      <SelectTrigger id="collaborator" className={errors.collaborator ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {collaborators.map((collab) => (
                          <SelectItem key={collab} value={collab}>
                            {collab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.collaborator && (
                      <p className="text-sm text-destructive">{errors.collaborator}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Select 
                      value={selectedDuration.toString()} 
                      onValueChange={(value) => setSelectedDuration(parseInt(value))}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value.toString()}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab("client")}
                    >
                      Voltar
                    </Button>
                    
                    <Button 
                      type="button" 
                      onClick={handleServiceNext}
                    >
                      Próximo
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Step 3: Date and Time Selection */}
                <TabsContent value="datetime" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDateTime">Data e Hora de Início *</Label>
                    <Input
                      id="startDateTime"
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className={errors.startDateTime ? "border-destructive" : ""}
                    />
                    {errors.startDateTime && (
                      <p className="text-sm text-destructive">{errors.startDateTime}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDateTime">Data e Hora de Término (calculado automaticamente)</Label>
                    <Input
                      id="endDateTime"
                      type="datetime-local"
                      value={endDateTime}
                      readOnly
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cor do Evento</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          type="button"
                          key={color}
                          className={cn(
                            "h-8 w-8 rounded-full cursor-pointer transition-transform transform hover:scale-110",
                            selectedColor === color &&
                              "ring-2 ring-offset-2 ring-primary",
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags Personalizadas</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge 
                          key={tag.id} 
                          style={{backgroundColor: tag.color}}
                          className="text-white flex items-center gap-1"
                        >
                          {tag.text}
                          <button 
                            type="button" 
                            onClick={() => removeTag(tag.id)}
                            className="ml-1 hover:bg-white/20 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="Nova tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        />
                        <input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                      </div>
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab("service")}
                    >
                      Voltar
                    </Button>
                    
                    <Button 
                      type="button" 
                      onClick={handleDateTimeNext}
                    >
                      Próximo
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Step 4: Attendance Type and Notes */}
                <TabsContent value="attendance" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendance-type">Forma de Atendimento</Label>
                    <Select 
                      value={attendanceType} 
                      onValueChange={setAttendanceType}
                    >
                      <SelectTrigger id="attendance-type">
                        <SelectValue placeholder="Selecione o tipo de atendimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {attendanceType === "presencial" ? (
                    <div className="space-y-2">
                      <Label htmlFor="location">Local *</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Endereço completo"
                        className={errors.location ? "border-destructive" : ""}
                      />
                      {errors.location && (
                        <p className="text-sm text-destructive">{errors.location}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="meeting-link">Link da Reunião *</Label>
                      <Input
                        id="meeting-link"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className={errors.meetingLink ? "border-destructive" : ""}
                      />
                      {errors.meetingLink && (
                        <p className="text-sm text-destructive">{errors.meetingLink}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="status-initial">Status Inicial</Label>
                    <Select 
                      value={initialStatus} 
                      onValueChange={(value: "confirmado" | "pendente") => setInitialStatus(value)}
                    >
                      <SelectTrigger id="status-initial">
                        <SelectValue placeholder="Selecione o status inicial" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmado">Agendamento Confirmado</SelectItem>
                        <SelectItem value="pendente">Agendamento Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Notas Internas (opcional)</Label>
                    <Textarea
                      id="eventDescription"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Observações adicionais sobre o agendamento..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="automation">Automação</Label>
                    <Select 
                      value={automation} 
                      onValueChange={setAutomation}
                    >
                      <SelectTrigger id="automation">
                        <SelectValue placeholder="Selecione uma automação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Lembrete por E-mail</SelectItem>
                        <SelectItem value="notification">Notificação no App</SelectItem>
                        <SelectItem value="none">Nenhum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter className="pt-4 flex justify-between">
              {event && onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="mr-auto"
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            {event && (
              <>
                <p className="font-medium">{event.summary}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(event.start), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                {event.attendees?.some(a => a?.email) && (
                  <p className="text-sm text-muted-foreground">
                    Participante: {event.attendees.find(a => a?.email)?.email}
                  </p>
                )}
              </>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}