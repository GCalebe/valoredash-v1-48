import React, { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { supabase } from "@/integrations/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { settings } = useThemeSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ email });
      setError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        toast.error("Erro ao enviar email de recuperação. Tente novamente.");
      } else {
        setSuccess(true);
        toast.success("Email de recuperação enviado com sucesso!");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro ao enviar email de recuperação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Email Enviado!</h1>
          <p className="text-white/80 mb-6">
            Verifique sua caixa de entrada e siga as instruções para redefinir
            sua senha.
          </p>
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
        <p className="text-white/80 mb-6">
          Digite seu email para receber as instruções de recuperação
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-hover:text-valore-gold transition-colors duration-300" />
          <Input
            type="email"
            name="email"
            placeholder="Digite seu email"
            value={email}
            onChange={handleChange}
            className={`pl-10 h-12 bg-white/10 dark:bg-gray-700/50 border-white/20 text-white rounded-md transition-all duration-300 hover:border-valore-gold/50 ${
              error ? "border-red-400" : "focus:border-valore-gold"
            }`}
            disabled={isLoading}
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-bold py-3 px-4 rounded-md transition-all duration-300"
          style={{
            backgroundColor: settings.secondaryColor,
            color: settings.accentColor,
          }}
        >
          {isLoading ? (
            <div
              className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin mr-2"
              style={{
                borderColor: settings.accentColor,
                borderTopColor: "transparent",
              }}
            ></div>
          ) : (
            <Mail className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Enviando..." : "Enviar Email de Recuperação"}
        </Button>

        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="w-full text-white hover:text-valore-gold hover:bg-white/10 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Login
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
