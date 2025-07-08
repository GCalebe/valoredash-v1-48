import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Link,
  ShipWheel,
  Plus,
  QrCode,
  Loader2,
  RefreshCw,
  Check,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

// Componente para o diálogo de adicionar instância
const AddInstanceDialog = ({ 
  isOpen, 
  onOpenChange, 
  instanceName, 
  setInstanceName, 
  handleCreateInstance, 
  isLoading 
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nova Conexão WhatsApp</DialogTitle>
        <DialogDescription>
          Crie uma nova instância do WhatsApp para sua equipe
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="instance-name">Nome da Instância</Label>
          <Input
            id="instance-name"
            placeholder="Ex: Atendimento Principal"
            className="dark:bg-gray-700"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCreateInstance}
          className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </span>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Criar Instância
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useThemeSettings();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<
    "waiting" | "confirmed" | "failed" | null
  >(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // Mock data for the connections dashboard
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

  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  // Função para parar o intervalo de verificação de status
  const stopStatusCheckInterval = () => {
    if (statusCheckIntervalRef.current !== null) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  // Função para lidar com conexão bem-sucedida
  const handleSuccessfulConnection = () => {
    console.log("Connection confirmed - stopping interval");
    stopStatusCheckInterval();
    setConfirmationStatus("confirmed");
    retryCountRef.current = 0; // Reset retry counter on success
    toast({
      title: "Conexão estabelecida!",
      description: "Seu WhatsApp foi conectado com sucesso.",
      variant: "default",
    });
  };

  // Função para lidar com falha na conexão
  const handleConnectionFailure = () => {
    retryCountRef.current += 1;
    console.log(
      `Connection failed - attempt ${retryCountRef.current} of ${maxRetries}`,
    );

    if (retryCountRef.current >= maxRetries) {
      console.log("Maximum retry attempts reached - updating QR code");
      stopStatusCheckInterval();
      setConfirmationStatus("failed");
      retryCountRef.current = 0; // Reset retry counter
      toast({
        title: "Falha na conexão",
        description:
          "Não foi possível conectar após várias tentativas. Obtendo novo QR code...",
        variant: "destructive",
      });
      updateQrCode(); // Automatically get a new QR code
    } else {
      console.log(
        `Retrying... (${retryCountRef.current}/${maxRetries})`,
      );
      toast({
        title: "Tentando novamente",
        description: `Tentativa ${retryCountRef.current} de ${maxRetries}`,
        variant: "default",
      });
    }
  };

  // Função para processar a resposta da API
  const processConnectionResponse = (responseData) => {
    if (responseData && typeof responseData.respond === "string") {
      const status = responseData.respond;
      console.log("Response status value:", status);

      if (status === "positivo") {
        handleSuccessfulConnection();
      } else if (status === "negativo") {
        handleConnectionFailure();
      } else {
        console.log("Unknown status value:", status);
        toast({
          title: "Status desconhecido",
          description: "Recebemos uma resposta inesperada do servidor.",
          variant: "destructive",
        });
      }
    } else {
      console.log(
        "Response does not have a valid respond property:",
        responseData,
      );
      toast({
        title: "Formato inesperado",
        description: "A resposta do servidor não está no formato esperado.",
        variant: "destructive",
      });
    }
  };

  // Função principal para verificar o status da conexão
  const checkConnectionStatus = async () => {
    try {
      console.log("Checking connection status for:", instanceName);
      const response = await fetch(
        "https://webhook.comercial247.com.br/webhook/confirma",
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
        console.log("Connection status response:", responseText);

        try {
          const responseData = JSON.parse(responseText);
          processConnectionResponse(responseData);
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          toast({
            title: "Erro de formato",
            description: "A resposta do servidor não está em formato JSON válido.",
            variant: "destructive",
          });
        }
      } else {
        console.error("HTTP error:", response.status, response.statusText);
        toast({
          title: "Erro de conexão",
          description: `Erro HTTP: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Erro de rede",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar o QR code
  const updateQrCode = async () => {
    try {
      console.log("Updating QR code for:", instanceName);
      const response = await fetch(
        "https://webhook.comercial247.com.br/webhook/qrcode",
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
        console.log("QR code response:", responseText);

        try {
          const responseData = JSON.parse(responseText);
          if (responseData && responseData.qrcode) {
            setQrCodeData(responseData.qrcode);
            setConfirmationStatus("waiting");
            retryCountRef.current = 0; // Reset retry counter
            console.log("QR code updated successfully");
          } else {
            console.error("No QR code in response:", responseData);
            toast({
              title: "Erro no QR code",
              description: "Não foi possível obter o QR code do servidor.",
              variant: "destructive",
            });
          }
        } catch (parseError) {
          console.error("Error parsing QR code JSON response:", parseError);
          toast({
            title: "Erro de formato",
            description: "A resposta do QR code não está em formato JSON válido.",
            variant: "destructive",
          });
        }
      } else {
        console.error("QR code HTTP error:", response.status, response.statusText);
        toast({
          title: "Erro ao obter QR code",
          description: `Erro HTTP: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("QR code network error:", error);
      toast({
        title: "Erro de rede",
        description: "Não foi possível conectar ao servidor para obter o QR code.",
        variant: "destructive",
      });
    }
  };

  // Função para iniciar o monitoramento de status
  const startStatusMonitoring = () => {
    console.log("Starting status monitoring");
    statusCheckIntervalRef.current = window.setInterval(() => {
      checkConnectionStatus();
    }, 5000); // Check every 5 seconds
  };

  // Função para criar uma nova instância
  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a instância.",
        variant: "destructive",
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
            setQrCodeData(responseData.qrcode);
            setConfirmationStatus("waiting");
            setIsAddDialogOpen(false);
            retryCountRef.current = 0; // Reset retry counter
            startStatusMonitoring();
            toast({
              title: "Instância criada!",
              description: "Escaneie o QR code para conectar o WhatsApp.",
              variant: "default",
            });
          } else {
            console.error("No QR code in response:", responseData);
            toast({
              title: "Erro na criação",
              description: "Instância criada, mas não foi possível obter o QR code.",
              variant: "destructive",
            });
          }
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          toast({
            title: "Erro de formato",
            description: "A resposta do servidor não está em formato JSON válido.",
            variant: "destructive",
          });
        }
      } else {
        console.error("HTTP error:", response.status, response.statusText);
        toast({
          title: "Erro na criação",
          description: `Erro HTTP: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Erro de rede",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para resetar o QR code
  const resetQrCode = () => {
    console.log("Resetting QR code");
    stopStatusCheckInterval();
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
  };

  // Função para tentar novamente
  const handleTryAgain = () => {
    console.log("Trying again - updating QR code");
    setConfirmationStatus("waiting");
    retryCountRef.current = 0; // Reset retry counter
    updateQrCode();
    startStatusMonitoring();
  };

  // Função para mostrar QR code de uma conexão existente
  const handleShowQrCode = async (connectionId) => {
    setInstanceName(connectionId);
    setIsLoading(true);
    try {
      await updateQrCode();
      startStatusMonitoring();
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
      variant: "default",
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full px-4 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Instâncias</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectionsData.totalInstances}</p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Link className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conectadas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectionsData.connectedInstances}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chats Ativos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectionsData.activeChats}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Mensagens</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{connectionsData.totalMessages}</p>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                    <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
      <Dialog open={!!qrCodeData} onOpenChange={() => qrCodeData && resetQrCode()}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR code com seu celular para conectar o WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 text-center">
            {confirmationStatus === "waiting" ? (
              <>
                <div className="bg-white p-4 rounded-md inline-block mx-auto">
                  <img
                    src={qrCodeData}
                    alt="QR Code para conectar WhatsApp"
                    className="mx-auto max-w-full h-auto"
                    style={{ maxHeight: "250px" }}
                  />
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="font-medium text-lg">
                    Conecte seu WhatsApp
                  </h3>
                  <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left list-decimal pl-5">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>
                      Toque em Menu ou Configurações e selecione Aparelhos
                      conectados
                    </li>
                    <li>Toque em Conectar um aparelho</li>
                    <li>Escaneie o código QR</li>
                  </ol>

                  <div className="mt-4 flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      Aguardando conexão
                      {retryCountRef.current > 0
                        ? ` (Tentativa ${retryCountRef.current}/${maxRetries})`
                        : "..."}
                    </span>
                  </div>
                </div>
              </>
            ) : confirmationStatus === "confirmed" ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Conectado com Sucesso!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Seu WhatsApp foi conectado à instância{" "}
                  <span className="font-semibold">{instanceName}</span>.
                </p>
                <Button
                  onClick={() => {
                    resetQrCode();
                    window.location.reload();
                  }}
                  variant="default"
                  className="mt-4"
                >
                  Concluir
                </Button>
              </div>
            ) : confirmationStatus === "failed" ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Falha na Conexão
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Não foi possível conectar o WhatsApp à instância{" "}
                  <span className="font-semibold">{instanceName}</span>{" "}
                  após várias tentativas.
                </p>
                <Button
                  onClick={handleTryAgain}
                  variant="default"
                  className="mt-4 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </span>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tentar Novamente
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetQrCode}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Evolution;