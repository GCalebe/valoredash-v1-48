import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Calendar, CalendarDays, Settings, Zap, AlertCircle, CheckCircle, Clock, Download, Upload, RefreshCw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface ApiConnection {
  id: string;
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: Date;
  accountId?: string;
  accessToken?: string;
}

interface SyncJob {
  id: string;
  platform: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startDate: Date;
  endDate: Date;
  recordsImported?: number;
  error?: string;
}

const ApiIntegrationPanel: React.FC = () => {
  const [connections, setConnections] = useState<ApiConnection[]>([
    {
      id: '1',
      platform: 'facebook',
      name: 'Facebook Ads - Conta Principal',
      status: 'connected',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      accountId: 'act_123456789',
      accessToken: 'EAABwz...'
    },
    {
      id: '2',
      platform: 'google',
      name: 'Google Ads - Campanha Principal',
      status: 'disconnected',
      accountId: '123-456-7890'
    }
  ]);

  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([
    {
      id: '1',
      platform: 'Facebook',
      status: 'completed',
      progress: 100,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      recordsImported: 245
    },
    {
      id: '2',
      platform: 'Google Ads',
      status: 'running',
      progress: 65,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    }
  ]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const getStatusIcon = (status: ApiConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ApiConnection['status']) => {
    const variants = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive',
      syncing: 'outline'
    } as const;

    const labels = {
      connected: 'Conectado',
      disconnected: 'Desconectado',
      error: 'Erro',
      syncing: 'Sincronizando'
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  const handleConnect = async (platform: string) => {
    setIsConnecting(true);
    // Simulate API connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update connection status
    setConnections(prev => prev.map(conn => 
      conn.platform === platform 
        ? { ...conn, status: 'connected' as const, lastSync: new Date() }
        : conn
    ));
    
    setIsConnecting(false);
  };

  const handleSync = async (connectionId: string) => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('Selecione um período para sincronização');
      return;
    }

    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Update connection status to syncing
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'syncing' as const }
        : conn
    ));

    // Create new sync job
    const newJob: SyncJob = {
      id: Date.now().toString(),
      platform: connection.name,
      status: 'running',
      progress: 0,
      startDate: dateRange.from,
      endDate: dateRange.to
    };

    setSyncJobs(prev => [newJob, ...prev]);

    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSyncJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, progress: Math.min(job.progress + 10, 100) }
          : job
      ));
    }, 500);

    // Complete sync after 5 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setSyncJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { ...job, status: 'completed' as const, progress: 100, recordsImported: Math.floor(Math.random() * 500) + 100 }
          : job
      ));
      
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connected' as const, lastSync: new Date() }
          : conn
      ));
    }, 5000);
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m atrás`;
    }
    return `${minutes}m atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Integração com APIs de Anúncios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte-se diretamente às plataformas de anúncios para importação automática de métricas
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Automação Ativa
        </Badge>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure suas conexões com as APIs das plataformas de anúncios. Certifique-se de ter as permissões necessárias.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {connection.platform.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{connection.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {connection.accountId && `ID: ${connection.accountId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Última sincronização: {formatLastSync(connection.lastSync)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(connection.status)}
                      {connection.status === 'connected' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSync(connection.id)}
                          disabled={connection.status === 'syncing'}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sincronizar
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(connection.platform)}
                          disabled={isConnecting}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Adicionar Nova Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plataforma</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook Ads</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="instagram">Instagram Ads</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nome da Conexão</Label>
                  <Input placeholder="Ex: Conta Principal" />
                </div>
              </div>
              <Button className="w-full" disabled={!selectedPlatform}>
                <Upload className="h-4 w-4 mr-2" />
                Configurar Conexão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Configurar Sincronização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Período para Sincronização</Label>
                <DatePickerWithRange 
                  date={dateRange} 
                  onDateChange={setDateRange}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequência Automática</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
              </div>

              <Alert>
                <CalendarDays className="h-4 w-4" />
                <AlertDescription>
                  A sincronização automática será executada no horário configurado. Dados dos últimos 7 dias serão atualizados.
                </AlertDescription>
              </Alert>

              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Iniciar Sincronização Manual
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {syncJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{job.platform}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.startDate.toLocaleDateString()} - {job.endDate.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={job.status === 'completed' ? 'default' : 
                              job.status === 'failed' ? 'destructive' : 'outline'}
                    >
                      {job.status === 'completed' && 'Concluído'}
                      {job.status === 'running' && 'Em andamento'}
                      {job.status === 'failed' && 'Falhou'}
                      {job.status === 'pending' && 'Pendente'}
                    </Badge>
                  </div>
                  
                  {job.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}
                  
                  {job.status === 'completed' && job.recordsImported && (
                    <p className="text-sm text-green-600">
                      ✓ {job.recordsImported} registros importados
                    </p>
                  )}
                  
                  {job.status === 'failed' && job.error && (
                    <p className="text-sm text-red-600">
                      ✗ {job.error}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiIntegrationPanel;