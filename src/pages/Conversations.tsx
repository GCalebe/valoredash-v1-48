import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Filter, Plus } from 'lucide-react';

interface Conversation {
  id: string;
  contact: string;
  lastMessage: string;
  timestamp: string;
  status: 'active' | 'pending' | 'closed';
  unreadCount: number;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    contact: 'João Silva',
    lastMessage: 'Obrigado pelas informações sobre o produto.',
    timestamp: '10:30',
    status: 'active',
    unreadCount: 2
  },
  {
    id: '2',
    contact: 'Maria Santos',
    lastMessage: 'Quando podemos agendar uma reunião?',
    timestamp: '09:15',
    status: 'pending',
    unreadCount: 1
  },
  {
    id: '3',
    contact: 'Pedro Costa',
    lastMessage: 'Perfeito! Vamos fechar o negócio.',
    timestamp: 'Ontem',
    status: 'closed',
    unreadCount: 0
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'pending': return 'Pendente';
    case 'closed': return 'Fechado';
    default: return 'Desconhecido';
  }
};

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredConversations = mockConversations.filter(conversation => {
    const matchesSearch = conversation.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || conversation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
            <p className="text-muted-foreground">
              Gerencie suas conversas e mensagens com clientes
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conversa
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{conversation.contact}</CardTitle>
                      <CardDescription className="text-sm">
                        {conversation.timestamp}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="rounded-full">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <Badge className={getStatusColor(conversation.status)}>
                      {getStatusText(conversation.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {conversation.lastMessage}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredConversations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conversa encontrada</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece uma nova conversa com seus clientes.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}