// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useWhatsAppConnection = () => {
  const { toast } = useToast();
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'waiting' | 'confirmed' | 'failed' | null>(null);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  const stopStatusCheckInterval = () => {
    if (statusCheckIntervalRef.current !== null) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  const handleSuccessfulConnection = () => {
    stopStatusCheckInterval();
    setConfirmationStatus('confirmed');
    retryCountRef.current = 0;
    toast({
      title: 'Conexão estabelecida!',
      description: 'Seu WhatsApp foi conectado com sucesso.',
      variant: 'default',
    });
  };

  const handleConnectionFailure = () => {
    retryCountRef.current += 1;
    if (retryCountRef.current >= maxRetries) {
      stopStatusCheckInterval();
      setConfirmationStatus('failed');
      retryCountRef.current = 0;
      toast({
        title: 'Falha na conexão',
        description: 'Não foi possível conectar após várias tentativas. Obtendo novo QR code...',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Tentando novamente',
        description: `Tentativa ${retryCountRef.current} de ${maxRetries}`,
        variant: 'default',
      });
    }
  };

  const processConnectionResponse = (responseData: { respond?: string; [key: string]: unknown }) => {
    if (responseData && typeof responseData.respond === 'string') {
      const status = responseData.respond;
      if (status === 'positivo') {
        handleSuccessfulConnection();
      } else if (status === 'negativo') {
        handleConnectionFailure();
      } else {
        toast({
          title: 'Status desconhecido',
          description: 'Recebemos uma resposta inesperada do servidor.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Formato inesperado',
        description: 'A resposta do servidor não está no formato esperado.',
        variant: 'destructive',
      });
    }
  };

  const checkConnectionStatus = async (instanceName: string) => {
    try {
      const response = await fetch('https://webhook.comercial247.com.br/webhook/confirma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: instanceName.trim() }),
      });

      if (response.ok) {
        const responseText = await response.text();
        try {
          const responseData = JSON.parse(responseText);
          processConnectionResponse(responseData);
        } catch {
          toast({
            title: 'Erro de formato',
            description: 'A resposta do servidor não está em formato JSON válido.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Erro de conexão',
          description: `Erro HTTP: ${response.status} ${response.statusText}`,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro de rede',
        description: 'Não foi possível conectar ao servidor.',
        variant: 'destructive',
      });
    }
  };

  const updateQrCode = async (instanceName: string) => {
    try {
      const response = await fetch('https://webhook.comercial247.com.br/webhook/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: instanceName.trim() }),
      });

      if (response.ok) {
        const responseText = await response.text();
        try {
          const responseData = JSON.parse(responseText);
          if (responseData && responseData.qrcode) {
            setQrCodeData(responseData.qrcode);
            setConfirmationStatus('waiting');
            retryCountRef.current = 0;
          } else {
            toast({
              title: 'Erro no QR code',
              description: 'Não foi possível obter o QR code do servidor.',
              variant: 'destructive',
            });
          }
        } catch {
          toast({
            title: 'Erro de formato',
            description: 'A resposta do QR code não está em formato JSON válido.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Erro ao obter QR code',
          description: `Erro HTTP: ${response.status} ${response.statusText}`,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Erro de rede',
        description: 'Não foi possível conectar ao servidor para obter o QR code.',
        variant: 'destructive',
      });
    }
  };

  const startStatusMonitoring = (instanceName: string) => {
    statusCheckIntervalRef.current = window.setInterval(() => {
      checkConnectionStatus(instanceName);
    }, 5000);
  };

  const resetQrCode = () => {
    stopStatusCheckInterval();
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
  };

  return {
    qrCodeData,
    confirmationStatus,
    retryCountRef,
    maxRetries,
    updateQrCode,
    checkConnectionStatus,
    startStatusMonitoring,
    resetQrCode,
  };
};

export default useWhatsAppConnection;
