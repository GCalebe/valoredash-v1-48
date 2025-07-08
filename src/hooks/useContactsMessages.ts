import { toast } from "@/hooks/use-toast";
import { Contact } from "@/types/client";

export const useContactsMessages = () => {
  const handlePauseDurationConfirm = async (
    selectedContact: Contact | null,
    messageText: string,
    duration: number | null,
    onSuccess: () => void,
  ) => {
    if (!selectedContact) return;

    try {
      const response = await fetch(
        "https://webhook.comercial247.com.br/webhook/envia_mensagem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: selectedContact.phone,
            message: messageText,
            pauseDuration: duration,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao enviar dados para o webhook");
      }

      onSuccess();

      toast({
        title: "Mensagem enviada",
        description:
          duration === null
            ? `Mensagem enviada para ${selectedContact.name} sem pausar o bot.`
            : `Mensagem enviada para ${selectedContact.name} e bot pausado por ${duration} segundos.`,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      onSuccess();

      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem para o servidor.",
        variant: "destructive",
      });
    }
  };

  return {
    handlePauseDurationConfirm,
  };
};
