// @ts-nocheck
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
import InstancesManager from "./disparador/components/InstancesManager";
import SendForm from "./disparador/components/SendForm";
import ContactsImporter from "./disparador/components/ContactsImporter";
import SchedulesList from "./disparador/components/SchedulesList";
import CampaignsHistory from "./disparador/components/CampaignsHistory";
import HelpSection from "./disparador/components/HelpSection";
import { APP_CONFIG } from "./disparador/constants";
import { Instance, Contact, Campaign, ScheduledDispatch } from "./disparador/types";

// tipos e constantes extraídos

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
            <InstancesManager
              instances={instances}
              newInstanceName={newInstanceName}
              newInstanceAPIKEY={newInstanceAPIKEY}
              showAPIKEY={showAPIKEY}
              isLoading={isLoading}
              onChangeNewInstanceName={setNewInstanceName}
              onChangeNewInstanceAPIKEY={setNewInstanceAPIKEY}
              onAddInstance={handleAddInstance}
              onToggleApiKey={toggleAPIKEYVisibility}
              onRemoveInstance={handleRemoveInstance}
            />
          </TabsContent>

          {/* Enviar */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de envio */}
              <SendForm
                instances={instances}
                selectedInstance={selectedInstance}
                onChangeInstance={setSelectedInstance}
                message={message}
                onChangeMessage={setMessage}
                mediaFile={mediaFile}
                onChooseFile={() => fileInputRef.current?.click()}
                onRemoveFile={() => setMediaFile(null)}
                onFileInputChange={handleFileUpload}
                fileInputRef={fileInputRef}
                enableScheduling={enableScheduling}
                onToggleScheduling={setEnableScheduling}
                scheduleDate={scheduleDate}
                onChangeScheduleDate={setScheduleDate}
                scheduleTime={scheduleTime}
                onChangeScheduleTime={setScheduleTime}
                contactsCount={contacts.length}
                isLoading={isLoading}
                onSubmit={handleSendCampaign}
              />

              {/* Lista de contatos */}
              <ContactsImporter contacts={contacts} onProcessFile={processContactsFile} />
            </div>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="history" className="space-y-6">
            <SchedulesList
              schedules={scheduledDispatches as any}
              instances={instances as any}
              onCancelSchedule={handleCancelSchedule}
              timeRemaining={getTimeRemaining}
            />
            
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