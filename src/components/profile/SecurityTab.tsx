// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function SecurityTab() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = async () => {
    if (!passwords.current) {
      toast({
        title: "Erro",
        description: "Digite sua senha atual.",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro", 
        description: "As senhas não coincidem.",
      });
      return;
    }

    // Validate password strength using the database function
    try {
      const { data: isValid, error: validationError } = await supabase.rpc('validate_password', {
        password: passwords.new
      });

      if (validationError) throw validationError;

      if (!isValid) {
        toast({
          title: "Senha não atende aos critérios",
          description: "A senha deve ter pelo menos 12 caracteres, incluindo maiúscula, minúscula, número e caractere especial.",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar a senha.",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      // Log security event
      await supabase.rpc('log_security_event', {
        _action: 'password_change',
        _resource: 'user_account',
        _success: true
      });

      // Update password_changed_at in profile
      await supabase
        .from('profiles')
        .update({ password_changed_at: new Date().toISOString() })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });

      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        _action: 'password_change',
        _resource: 'user_account',
        _success: false,
        _error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
      });
    } finally {
      setLoading(false);
    }
  };

  const securityScore = 75; // Mock security score

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pontuação de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${securityScore}, 100`}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{securityScore}%</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Sua conta está bem protegida</h3>
              <p className="text-sm text-muted-foreground">
                Continue seguindo as melhores práticas de segurança para manter sua conta segura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Digite sua senha atual"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              placeholder="Confirme sua nova senha"
            />
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
            className="w-full"
          >
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Recursos de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
            </div>
            <Badge variant="outline">Indisponível</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Login Seguro</h4>
                <p className="text-sm text-muted-foreground">
                  Conexão criptografada ativa
                </p>
              </div>
            </div>
            <Badge variant="default">Ativo</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <h4 className="font-medium">Sessões Ativas</h4>
                <p className="text-sm text-muted-foreground">
                  Monitore dispositivos conectados
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Gerenciar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}