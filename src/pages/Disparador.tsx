import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import {
  ArrowLeft,
  LogOut,
  Upload,
  Send,
  Server,
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Shield,
  BookOpen,
  Zap,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Instance {
  id: string;
  name: string;
  apikey: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
}

interface Contact {
  number: string;
  name?: string;
}

interface Campaign {
  id: string;
  name: string;
  message: string;
  contacts: Contact[];
  media?: File;
  status: 'pending' | 'sending' | 'completed' | 'failed';
  sent: number;
  total: number;
  createdAt: Date;
}

interface ScheduledDispatch {
  id: string;
  scheduledDateTime: Date;
  instanceId: string;
  message: string;
  contacts: Contact[];
  media?: File;
  status: 'scheduled' | 'executing' | 'completed' | 'cancelled' | 'failed';
  createdAt: Date;
}

const APP_CONFIG = {
  webhookUrl: 'https://webhook.zapplify.app.br/webhook/disparadorProV2',
  webhookConexao: 'https://webhook.zapplify.app.br/webhook/verificarConexao',
  version: '2.4',
};

const Disparador: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { settings } = useThemeSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceAPIKEY, setNewInstanceAPIKEY] = useState('');
  const [showAPIKEY, setShowAPIKEY] = useState<{[key: string]: boolean}>({});
  
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState('config');
  
  // Estados para agendamento
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduledDispatches, setScheduledDispatches] = useState<ScheduledDispatch[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Carregar instâncias salvas
  useEffect(() => {
    const savedInstances = localStorage.getItem('disparador_instances');
    if (savedInstances) {
      try {
        setInstances(JSON.parse(savedInstances));
      } catch (error) {
        console.error('Erro ao carregar instâncias:', error);
      }
    }
    
    // Carregar agendamentos salvos
    const savedSchedules = localStorage.getItem('disparador_scheduled');
    if (savedSchedules) {
      try {
        const parsed = JSON.parse(savedSchedules);
        const schedules = parsed.map((s: { scheduledDateTime: string; createdAt: string; [key: string]: unknown }) => ({
          ...s,
          scheduledDateTime: new Date(s.scheduledDateTime),
          createdAt: new Date(s.createdAt)
        }));
        setScheduledDispatches(schedules);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
    }
    
    // Configurar data e hora mínimas
    const today = new Date();
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const minDate = localDate.toISOString().split('T')[0];
    setScheduleDate(minDate);
    
    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
    const timeString = nextHour.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    setScheduleTime(timeString);
  }, []);

  // Salvar instâncias
  const saveInstances = (newInstances: Instance[]) => {
    localStorage.setItem('disparador_instances', JSON.stringify(newInstances));
    setInstances(newInstances);
  };
  
  // Salvar agendamentos
  const saveScheduledDispatches = (schedules: ScheduledDispatch[]) => {
    const dataToSave = schedules.map(schedule => ({
      ...schedule,
      scheduledDateTime: schedule.scheduledDateTime.toISOString(),
      createdAt: schedule.createdAt.toISOString()
    }));
    localStorage.setItem('disparador_scheduled', JSON.stringify(dataToSave));
    setScheduledDispatches(schedules);
  };

  // Adicionar nova instância
  const handleAddInstance = async () => {
    if (!newInstanceName.trim() || !newInstanceAPIKEY.trim()) {
      toast({
        title: "Erro",
        description: "Preencha nome da instância e APIKEY",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(APP_CONFIG.webhookConexao, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: newInstanceName,
          instanceAPIKEY: newInstanceAPIKEY
        })
      });

      const data = await response.json();
      
      if (data.result === 'error') {
        toast({
          title: "Erro",
          description: "Credenciais inválidas! Verifique o nome da instância e APIKEY.",
          variant: "destructive"
        });
        return;
      }

      const newInstance: Instance = {
        id: Date.now().toString(),
        name: newInstanceName,
        apikey: newInstanceAPIKEY,
        status: data.result === 'open' ? 'connected' : 'disconnected',
        qrCode: data.qrCode
      };

      const updatedInstances = [...instances, newInstance];
      saveInstances(updatedInstances);
      
      setNewInstanceName('');
      setNewInstanceAPIKEY('');
      
      toast({
        title: "Sucesso",
        description: "Instância adicionada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao adicionar instância:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar credenciais. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remover instância
  const handleRemoveInstance = (instanceId: string) => {
    const updatedInstances = instances.filter(inst => inst.id !== instanceId);
    saveInstances(updatedInstances);
    if (selectedInstance === instanceId) {
      setSelectedInstance('');
    }
    toast({
      title: "Sucesso",
      description: "Instância removida com sucesso!"
    });
  };

  // Upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Tipo de arquivo não suportado",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar tamanho (máximo 16MB)
      if (file.size > 16 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 16MB",
          variant: "destructive"
        });
        return;
      }
      
      setMediaFile(file);
    }
  };

  // Processar planilha de contatos
  const processContactsFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const newContacts: Contact[] = [];
        
        lines.forEach((line, index) => {
          if (index === 0) return; // Skip header
          const [number, name] = line.split(',').map(s => s.trim());
          if (number) {
            newContacts.push({ number, name });
          }
        });
        
        setContacts(newContacts);
        toast({
          title: "Sucesso",
          description: `${newContacts.length} contatos carregados`
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao processar arquivo de contatos",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  // Agendar disparo
  const handleScheduleDispatch = () => {
    if (!selectedInstance || !message.trim() || contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Erro",
        description: "Selecione data e hora para o agendamento",
        variant: "destructive"
      });
      return;
    }
    
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      toast({
        title: "Erro",
        description: "A data/hora deve ser no futuro",
        variant: "destructive"
      });
      return;
    }
    
    const newSchedule: ScheduledDispatch = {
      id: Date.now().toString(),
      scheduledDateTime,
      instanceId: selectedInstance,
      message,
      contacts: [...contacts],
      media: mediaFile || undefined,
      status: 'scheduled',
      createdAt: new Date()
    };
    
    const updatedSchedules = [...scheduledDispatches, newSchedule];
    saveScheduledDispatches(updatedSchedules);
    
    toast({
      title: "Sucesso",
      description: `Disparo agendado para ${scheduledDateTime.toLocaleString('pt-BR')}`
    });
    
    // Limpar formulário
    setEnableScheduling(false);
    setMessage('');
    setContacts([]);
    setMediaFile(null);
    setActiveTab('history');
  };
  
  // Enviar campanha
  const handleSendCampaign = async () => {
    if (!selectedInstance) {
      toast({
        title: "Erro",
        description: "Selecione uma instância",
        variant: "destructive"
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem",
        variant: "destructive"
      });
      return;
    }
    
    if (contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione contatos",
        variant: "destructive"
      });
      return;
    }
    
    // Se agendamento estiver habilitado, agendar ao invés de enviar
    if (enableScheduling) {
      handleScheduleDispatch();
      return;
    }

    const selectedInst = instances.find(inst => inst.id === selectedInstance);
    if (!selectedInst) return;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: `Campanha ${new Date().toLocaleString()}`,
      message,
      contacts,
      media: mediaFile || undefined,
      status: 'sending',
      sent: 0,
      total: contacts.length,
      createdAt: new Date()
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setActiveTab('history');
    
    setIsLoading(true);
    
    try {
      // Simular envio (aqui você implementaria a lógica real de envio)
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        
        // Simular delay entre envios
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Atualizar progresso
        setCampaigns(prev => prev.map(camp => 
          camp.id === newCampaign.id 
            ? { ...camp, sent: i + 1 }
            : camp
        ));
      }
      
      // Marcar como concluída
      setCampaigns(prev => prev.map(camp => 
        camp.id === newCampaign.id 
          ? { ...camp, status: 'completed' }
          : camp
      ));
      
      toast({
        title: "Sucesso",
        description: "Campanha enviada com sucesso!"
      });
      
      // Limpar formulário
      setMessage('');
      setContacts([]);
      setMediaFile(null);
      
    } catch (error) {
      console.error('Erro no envio:', error);
      setCampaigns(prev => prev.map(camp => 
        camp.id === newCampaign.id 
          ? { ...camp, status: 'failed' }
          : camp
      ));
      
      toast({
        title: "Erro",
        description: "Erro no envio da campanha",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAPIKEYVisibility = (instanceId: string) => {
    setShowAPIKEY(prev => ({
      ...prev,
      [instanceId]: !prev[instanceId]
    }));
  };
  
  // Cancelar agendamento
  const handleCancelSchedule = (scheduleId: string) => {
    const updatedSchedules = scheduledDispatches.filter(s => s.id !== scheduleId);
    saveScheduledDispatches(updatedSchedules);
    toast({
      title: "Sucesso",
      description: "Agendamento cancelado"
    });
  };
  
  // Calcular tempo restante
  const getTimeRemaining = (scheduledDateTime: Date) => {
    const now = new Date();
    const timeUntil = scheduledDateTime.getTime() - now.getTime();
    
    if (timeUntil <= 0) return 'Executando...';
    
    const hours = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header
        className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 focus-visible:ring-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">{settings.brandName}</h1>
                <span className="text-sm opacity-90">Disparador PRO v{APP_CONFIG.version}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-white text-white bg-transparent hover:bg-white/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Ajuda
            </TabsTrigger>
          </TabsList>

          {/* Configurações */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Gerenciar Instâncias WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário para nova instância */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="instanceName">Nome da Instância</Label>
                    <Input
                      id="instanceName"
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                      placeholder="Ex: WhatsApp Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instanceAPIKEY">APIKEY</Label>
                    <Input
                      id="instanceAPIKEY"
                      type="password"
                      value={newInstanceAPIKEY}
                      onChange={(e) => setNewInstanceAPIKEY(e.target.value)}
                      placeholder="Digite a APIKEY"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddInstance}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                  </div>
                </div>

                {/* Lista de instâncias */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Instâncias Cadastradas</h3>
                    <Badge variant="secondary">
                      {instances.filter(inst => inst.status === 'connected').length} ativas
                    </Badge>
                  </div>
                  
                  {instances.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma instância cadastrada</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {instances.map((instance) => (
                        <Card key={instance.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                instance.status === 'connected' ? 'bg-green-500' :
                                instance.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <h4 className="font-semibold">{instance.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Key className="h-3 w-3" />
                                  {showAPIKEY[instance.id] ? instance.apikey : '••••••••••••'}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleAPIKEYVisibility(instance.id)}
                                  >
                                    {showAPIKEY[instance.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={instance.status === 'connected' ? 'default' : 'secondary'}>
                                {instance.status === 'connected' ? 'Conectado' :
                                 instance.status === 'connecting' ? 'Conectando' : 'Desconectado'}
                              </Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveInstance(instance.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enviar */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de envio */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Configurar Disparo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="selectInstance">Instância</Label>
                    <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma instância" />
                      </SelectTrigger>
                      <SelectContent>
                        {instances.filter(inst => inst.status === 'connected').map((instance) => (
                          <SelectItem key={instance.id} value={instance.id}>
                            {instance.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua mensagem aqui..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {message.length}/1000 caracteres
                    </p>
                  </div>

                  <div>
                    <Label>Mídia (Opcional)</Label>
                    <div className="mt-2">
                      {mediaFile ? (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{mediaFile.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMediaFile(null)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Selecionar Arquivo
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,audio/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Seção de Agendamento */}
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          id="enableScheduling"
                          checked={enableScheduling}
                          onChange={(e) => setEnableScheduling(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="enableScheduling" className="cursor-pointer">
                          Agendar este disparo
                        </label>
                      </CardTitle>
                    </CardHeader>
                    {enableScheduling && (
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="scheduleDate">Data</Label>
                            <Input
                              id="scheduleDate"
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div>
                            <Label htmlFor="scheduleTime">Hora</Label>
                            <Input
                              id="scheduleTime"
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          O disparo será executado automaticamente na data/hora especificada
                        </p>
                      </CardContent>
                    )}
                  </Card>

                  <Button
                    onClick={handleSendCampaign}
                    disabled={isLoading || !selectedInstance || !message.trim() || contacts.length === 0}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isLoading ? 'Enviando...' : enableScheduling ? 'Agendar Disparo' : `Enviar para ${contacts.length} contatos`}
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de contatos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contatos ({contacts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Importar Contatos</Label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processContactsFile(file);
                      }}
                      className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formato: número,nome (um por linha)
                    </p>
                  </div>

                  {contacts.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {contacts.slice(0, 10).map((contact, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{contact.number}</p>
                            {contact.name && (
                              <p className="text-xs text-muted-foreground">{contact.name}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {contacts.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{contacts.length - 10} contatos adicionais
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="history" className="space-y-6">
            {/* Agendamentos Ativos */}
            {scheduledDispatches.filter(s => s.status === 'scheduled').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agendamentos Ativos
                    <Badge variant="secondary">
                      {scheduledDispatches.filter(s => s.status === 'scheduled').length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduledDispatches
                      .filter(s => s.status === 'scheduled')
                      .map((schedule) => {
                        const instance = instances.find(i => i.id === schedule.instanceId);
                        return (
                          <Card key={schedule.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">
                                  Agendado para {schedule.scheduledDateTime.toLocaleString('pt-BR')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Instância: {instance?.name || 'Desconhecida'} • {schedule.contacts.length} contatos
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {getTimeRemaining(schedule.scheduledDateTime)}
                                </Badge>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelSchedule(schedule.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {schedule.message.substring(0, 100)}...
                            </p>
                          </Card>
                        );
                      })
                    }
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Histórico de Campanhas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Histórico de Campanhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma campanha enviada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <Badge variant={
                            campaign.status === 'completed' ? 'default' :
                            campaign.status === 'sending' ? 'secondary' :
                            campaign.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {campaign.status === 'completed' ? 'Concluída' :
                             campaign.status === 'sending' ? 'Enviando' :
                             campaign.status === 'failed' ? 'Falhou' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {campaign.message.substring(0, 100)}...
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso: {campaign.sent}/{campaign.total}</span>
                          <span>{campaign.createdAt.toLocaleString()}</span>
                        </div>
                        {campaign.status === 'sending' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(campaign.sent / campaign.total) * 100}%` }}
                            />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ajuda */}
          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Como Usar o Disparador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      1. Configurar Instâncias
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione suas instâncias do WhatsApp com nome e APIKEY. Certifique-se de que estejam conectadas.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      2. Importar Contatos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Faça upload de um arquivo CSV ou TXT com os contatos no formato: número,nome (um por linha).
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      3. Criar Mensagem
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Digite sua mensagem e, opcionalmente, adicione uma mídia (imagem, vídeo, áudio ou PDF).
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      4. Enviar Campanha
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione a instância, revise os dados e clique em enviar. Acompanhe o progresso no histórico.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Dicas de Segurança</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                        <li>• Respeite os limites de envio do WhatsApp</li>
                        <li>• Não envie spam ou mensagens não solicitadas</li>
                        <li>• Mantenha suas APIKEYs seguras</li>
                        <li>• Teste com poucos contatos primeiro</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Disparador;