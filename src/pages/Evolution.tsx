import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Link,
  ShipWheel,
  Plus,
  QrCode,
  Smartphone,
  Wifi,
  MessageSquare,
  Activity,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";

import { useToast } from "@/hooks/use-toast";
import StatsCards from "@/components/evolution/StatsCards";
import AddInstanceDialog from "@/components/evolution/AddInstanceDialog";
import QrCodeDialog from "@/components/evolution/QrCodeDialog";
import useWhatsAppConnection from "@/hooks/useWhatsAppConnection";

// Componente para um item de estatística
const StatItem = ({ icon, value, label, bgColor }) => (
  <div className={`${bgColor} p-4 rounded-lg text-center`}>
    {icon}
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

// Componente para as estatísticas da conexão
const ConnectionStats = ({ stats }) => (
  <div className="grid grid-cols-3 gap-2">
    <StatItem 
      icon={<MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-400" />}
      value={stats.messages}
      label="Mensagens"
      bgColor="bg-blue-900/20"
    />
    <StatItem 
      icon={<Users className="h-5 w-5 mx-auto mb-1 text-purple-400" />}
      value={stats.contacts}
      label="Contatos"
      bgColor="bg-purple-900/20"
    />
    <StatItem 
      icon={<MessageSquare className="h-5 w-5 mx-auto mb-1 text-green-400" />}
      value={stats.chats}
      label="Chats"
      bgColor="bg-green-900/20"
    />
  </div>
);

// Componente para o conteúdo de uma conexão conectando
const ConnectingContent = ({ connection }) => (
  <>
    <div className="flex items-center text-yellow-400 text-sm">
      <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></div>
      {connection.statusText}
    </div>
    
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
      <div className="bg-blue-900/30 p-2 rounded-full">
        <Activity className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <p className="font-medium">{connection.lastActivity}</p>
        <p className="text-xs text-gray-400">Última atividade</p>
      </div>
    </div>
    
    <ConnectionStats stats={connection.stats} />
  </>
);

// Componente para o conteúdo de uma conexão conectada
const ConnectedContent = ({ connection }) => (
  <>
    <div className="flex items-center text-green-400 text-sm">
      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
      {connection.statusText}
    </div>
    
    {connection.phone && (
      <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
        <div className="bg-green-900/30 p-2 rounded-full">
          <Smartphone className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <p className="font-medium">{connection.phone}</p>
          <p className="text-xs text-gray-400">{connection.phoneLabel}</p>
        </div>
      </div>
    )}
    
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3">
      <div className="bg-blue-900/30 p-2 rounded-full">
        <Activity className="h-5 w-5 text-blue-400" />
      </div>
      <div>
        <p className="font-medium">{connection.lastActivity}</p>
        <p className="text-xs text-gray-400">Última atividade</p>
      </div>
    </div>
    
    <ConnectionStats stats={connection.stats} />
    
    {connection.badges && (
      <div className="flex flex-wrap gap-2">
        {connection.badges.map((badge, index) => (
          <Badge 
            key={index} 
            className={`
              ${badge.color === 'blue' ? 'bg-blue-900/30 text-blue-400' : ''}
              ${badge.color === 'purple' ? 'bg-purple-900/30 text-purple-400' : ''}
              ${badge.color === 'green' ? 'bg-green-900/30 text-green-400' : ''}
            `}
          >
            {badge.text}
          </Badge>
        ))}
      </div>
    )}
  </>
);

// Componente para o status da conexão
const ConnectionStatusBadge = ({ status }) => {
  if (status === "connected") {
    return (
      <Badge className="bg-green-500 text-white">
        Conectado
      </Badge>
    );
  } else if (status === "connecting") {
    return (
      <Badge className="bg-yellow-500 text-white">
        Conectando
      </Badge>
    );
  }
  return null;
};

// Componente para um card de conexão
const ConnectionCard = ({ connection, onShowQrCode, onDisconnect }) => (
  <Card className="bg-gray-800 text-white border-gray-700">
    <CardHeader className="pb-2 flex flex-row justify-between items-start">
      <div>
        <CardTitle className="text-xl">{connection.name}</CardTitle>
        <p className="text-gray-400">{connection.displayName}</p>
      </div>
      <ConnectionStatusBadge status={connection.status} />
    </CardHeader>
    <CardContent className="space-y-4">
      {connection.status === "connected" ? (
        <ConnectedContent connection={connection} />
      ) : (
        <ConnectingContent connection={connection} />
      )}
      
      <div className="flex gap-2 mt-2">
        <Button 
          variant="outline" 
          className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-900/20"
          onClick={() => onShowQrCode(connection.id)}
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 border-red-500 text-red-400 hover:bg-red-900/20"
          onClick={() => onDisconnect(connection.id)}
        >
          <X className="h-4 w-4 mr-2" />
          Desconectar
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Componente para a lista de cards de conexão
const ConnectionCardsList = ({ connections, onShowQrCode, onDisconnect }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {connections.map((connection) => (
      <ConnectionCard 
        key={connection.id} 
        connection={connection} 
        onShowQrCode={onShowQrCode} 
        onDisconnect={onDisconnect} 
      />
    ))}
  </div>
);


const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useThemeSettings();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { qrCodeData, confirmationStatus, retryCountRef, maxRetries, updateQrCode, startStatusMonitoring, resetQrCode } = useWhatsAppConnection();
  const connectionsData = {
    totalInstances: 2,
    connectedInstances: 1,
    activeChats: 500,
    totalMessages: 3926,
    connections: [
      {
        id: "valore",
        name: "valore",
        displayName: "calebe valore",
        status: "connected",
        statusText: "Online e funcionando",
        phone: "+55 (81) 99999-9999",
        phoneLabel: "Número vinculado",
        lastActivity: "27/06/2025, 19:37:09",
        stats: {
          messages: 3926,
          contacts: 588,
          chats: 500,
        },
        badges: [
          { text: "Alto volume", color: "blue" },
          { text: "Rede ampla", color: "purple" },
          { text: "Ativo", color: "green" },
        ],
      },
      {
        id: "atendente1",
        name: "atendente1",
        displayName: "atendente 1",
        status: "connecting",
        statusText: "Estabelecendo conexão...",
        lastActivity: "29/06/2025, 07:22:13",
        stats: {
          messages: 0,
          contacts: 0,
          chats: 0,
        },
      },
    ],
  };


  // Função para criar uma nova instância
  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a instância.",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating instance:", instanceName);
      const response = await fetch(
        "https://webhook.comercial247.com.br/webhook/instance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instanceName: instanceName.trim(),
          }),
        },
      );

      if (response.ok) {
        const responseText = await response.text();
        console.log("Instance creation response:", responseText);

        try {
          const responseData = JSON.parse(responseText);
          if (responseData && responseData.qrcode) {
            setIsAddDialogOpen(false);
            await updateQrCode(instanceName);
            startStatusMonitoring(instanceName);
            toast({
              title: "Instância criada!",
              description: "Escaneie o QR code para conectar o WhatsApp.",
            });
          } else {
            console.error("No QR code in response:", responseData);
            toast({
              title: "Erro na criação",
              description: "Instância criada, mas não foi possível obter o QR code.",
            });
          }
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          toast({
            title: "Erro de formato",
            description: "A resposta do servidor não está em formato JSON válido.",
          });
        }
      } else {
        console.error("HTTP error:", response.status, response.statusText);
        toast({
          title: "Erro na criação",
          description: `Erro HTTP: ${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Erro de rede",
        description: "Não foi possível conectar ao servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tentar novamente
  const handleTryAgain = async () => {
    console.log("Trying again - updating QR code");
    setIsLoading(true);
    await updateQrCode(instanceName);
    startStatusMonitoring(instanceName);
    setIsLoading(false);
  };

  // Função para mostrar QR code de uma conexão existente
  const handleShowQrCode = async (connectionId) => {
    setInstanceName(connectionId);
    setIsLoading(true);
    try {
      await updateQrCode(connectionId);
      startStatusMonitoring(connectionId);
    } catch (error) {
      console.error("Error showing QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para desconectar uma instância
  const handleDisconnect = (connectionId) => {
    console.log("Disconnecting:", connectionId);
    toast({
      title: "Desconectando",
      description: `Desconectando a instância ${connectionId}...`,
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header
        className="shadow-md transition-colors duration-300 rounded-b-xl"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
          <div className="flex items-center gap-4 min-w-0 h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 focus-visible:ring-white"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <ShipWheel
                className="h-8 w-8"
                style={{ color: settings.secondaryColor }}
              />
            )}
            <h1 className="text-xl font-bold text-white">
              {settings.brandName}
            </h1>
            <span className="text-base ml-1 opacity-80 text-white">
              Evolution API
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-fit">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border border-white/40 px-3 py-1 font-normal rounded-md"
            >
              {user?.user_metadata?.name || user?.email}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full px-4 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Stats Cards */}
            <StatsCards stats={connectionsData} />

        {/* Connections Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conexões WhatsApp</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conexão
          </Button>
        </div>

        {/* Connections Grid */}
        <ConnectionCardsList 
          connections={connectionsData.connections} 
          onShowQrCode={handleShowQrCode} 
          onDisconnect={handleDisconnect} 
        />
        </div>
      </main>

      {/* Add Instance Dialog */}
      <AddInstanceDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        instanceName={instanceName}
        setInstanceName={setInstanceName}
        handleCreateInstance={handleCreateInstance}
        isLoading={isLoading}
      />

      {/* QR Code Dialog */}
      <QrCodeDialog
        qrCodeData={qrCodeData}
        confirmationStatus={confirmationStatus}
        retryCount={retryCountRef.current}
        maxRetries={maxRetries}
        isLoading={isLoading}
        handleTryAgain={handleTryAgain}
        resetQrCode={resetQrCode}
        instanceName={instanceName}
      />
    </div>
  );
};

export default Evolution;
