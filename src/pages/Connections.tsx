// @ts-nocheck
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  Settings, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'sms' | 'webhook';
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  lastSync: string;
  icon: React.ReactNode;
}

const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'WhatsApp Business',
    type: 'whatsapp',
    status: 'connected',
    description: 'Integração com WhatsApp Business API',
    lastSync: '2 minutos atrás',
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    id: '2',
    name: 'Email Marketing',
    type: 'email',
    status: 'connected',
    description: 'Envio de emails automatizados',
    lastSync: '5 minutos atrás',
    icon: <Mail className="h-5 w-5" />
  },
  {
    id: '3',
    name: 'SMS Gateway',
    type: 'sms',
    status: 'disconnected',
    description: 'Envio de mensagens SMS',
    lastSync: '2 horas atrás',
    icon: <Phone className="h-5 w-5" />
  },
  {
    id: '4',
    name: 'Webhook CRM',
    type: 'webhook',
    status: 'error',
    description: 'Integração com sistema externo',
    lastSync: '1 dia atrás',
    icon: <Globe className="h-5 w-5" />
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
    case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
    default: return <XCircle className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected': return 'bg-green-100 text-green-800';
    case 'disconnected': return 'bg-gray-100 text-gray-800';
    case 'error': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'connected': return 'Conectado';
    case 'disconnected': return 'Desconectado';
    case 'error': return 'Erro';
    default: return 'Desconhecido';
  }
};

export default function Connections() {
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conexões</h1>
            <p className="text-muted-foreground">
              Gerencie integrações e conexões externas
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conexão
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Conexões Ativas</h2>
            {mockConnections.map((connection) => (
              <Card 
                key={connection.id} 
                className={`cursor-pointer transition-all ${
                  selectedConnection === connection.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedConnection(connection.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {connection.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {connection.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connection.status)}
                      <Badge className={getStatusColor(connection.status)}>
                        {getStatusText(connection.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Última sincronização: {connection.lastSync}
                    </span>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Configurações</h2>
            {selectedConnection ? (
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Conexão</CardTitle>
                  <CardDescription>
                    Ajuste as configurações da conexão selecionada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="connection-name">Nome da Conexão</Label>
                    <Input 
                      id="connection-name" 
                      placeholder="Nome da conexão" 
                      defaultValue={mockConnections.find(c => c.id === selectedConnection)?.name}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Chave da API</Label>
                    <Input 
                      id="api-key" 
                      type="password" 
                      placeholder="••••••••••••••••" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://api.exemplo.com/webhook" 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-sync" />
                    <Label htmlFor="auto-sync">Sincronização automática</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" defaultChecked />
                    <Label htmlFor="notifications">Notificações de status</Label>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Salvar Configurações</Button>
                    <Button variant="outline">Testar Conexão</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione uma Conexão</h3>
                  <p className="text-muted-foreground text-center">
                    Escolha uma conexão à esquerda para configurar suas opções.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conexões Disponíveis</CardTitle>
            <CardDescription>
              Adicione novas integrações ao seu sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-semibold">Telegram</h4>
                <p className="text-sm text-muted-foreground">Integração com Telegram Bot</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-semibold">Zapier</h4>
                <p className="text-sm text-muted-foreground">Automação com Zapier</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-semibold">Mailchimp</h4>
                <p className="text-sm text-muted-foreground">Email marketing avançado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}