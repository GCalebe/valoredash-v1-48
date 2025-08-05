// @ts-nocheck
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Mail, 
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const { settings, loading, saveSettings, getSetting, initialized } = useUserSettings();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    // Perfil
    fullName: '',
    email: '',
    bio: '',
    
    // Segurança
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    
    // Notificações
    notifications: {
      email: true,
      push: false,
      sms: true,
      marketing: false
    },
    
    // Aparência
    theme: 'system',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    
    // Sistema
    autoBackup: true,
    analytics: true,
    betaFeatures: false
  });
  
  // Carregar configurações quando inicializado
  useEffect(() => {
    if (initialized) {
      setFormData({
        fullName: getSetting('profile.fullName', '') as string,
        email: getSetting('profile.email', '') as string,
        bio: getSetting('profile.bio', '') as string,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: getSetting('security.twoFactorEnabled', false) as boolean,
        notifications: {
          email: getSetting('notifications.email', true) as boolean,
          push: getSetting('notifications.push', false) as boolean,
          sms: getSetting('notifications.sms', true) as boolean,
          marketing: getSetting('notifications.marketing', false) as boolean
        },
        theme: getSetting('appearance.theme', 'system') as string,
        language: getSetting('appearance.language', 'pt-BR') as string,
        timezone: getSetting('appearance.timezone', 'America/Sao_Paulo') as string,
        autoBackup: getSetting('system.autoBackup', true) as boolean,
        analytics: getSetting('system.analytics', true) as boolean,
        betaFeatures: getSetting('system.betaFeatures', false) as boolean
      });
    }
  }, [initialized, getSetting]);
  
  // Handler para salvar configurações
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: 'profile.fullName', value: formData.fullName },
        { key: 'profile.email', value: formData.email },
        { key: 'profile.bio', value: formData.bio },
        { key: 'security.twoFactorEnabled', value: formData.twoFactorEnabled },
        { key: 'notifications.email', value: formData.notifications.email },
        { key: 'notifications.push', value: formData.notifications.push },
        { key: 'notifications.sms', value: formData.notifications.sms },
        { key: 'notifications.marketing', value: formData.notifications.marketing },
        { key: 'appearance.theme', value: formData.theme },
        { key: 'appearance.language', value: formData.language },
        { key: 'appearance.timezone', value: formData.timezone },
        { key: 'system.autoBackup', value: formData.autoBackup },
        { key: 'system.analytics', value: formData.analytics },
        { key: 'system.betaFeatures', value: formData.betaFeatures }
      ];
      
      const result = await saveSettings(updates);
      if (result.success) {
        toast({
          title: "Configurações salvas",
          description: "Suas configurações foram atualizadas com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handler para cancelar alterações
  const handleCancelSettings = () => {
    if (initialized) {
      setFormData({
        fullName: getSetting('profile.fullName', '') as string,
        email: getSetting('profile.email', '') as string,
        bio: getSetting('profile.bio', '') as string,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactor: getSetting('security.twoFactorEnabled', false) as boolean,
        notifications: {
          email: getSetting('notifications.email', true) as boolean,
          push: getSetting('notifications.push', false) as boolean,
          sms: getSetting('notifications.sms', true) as boolean,
          marketing: getSetting('notifications.marketing', false) as boolean
        },
        theme: getSetting('appearance.theme', 'system') as string,
        language: getSetting('appearance.language', 'pt-BR') as string,
        timezone: getSetting('appearance.timezone', 'America/Sao_Paulo') as string,
        autoBackup: getSetting('system.autoBackup', true) as boolean,
        analytics: getSetting('system.analytics', true) as boolean,
        betaFeatures: getSetting('system.betaFeatures', false) as boolean
      });
      
      toast({
        title: "Alterações canceladas",
        description: "As configurações foram restauradas para os valores salvos.",
      });
    }
  };
  
  if (!initialized) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>

        <div className="grid gap-6">
          {/* Perfil do Usuário */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Perfil do Usuário</CardTitle>
              </div>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input 
                  id="fullName" 
                  placeholder="Seu nome completo" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Conte um pouco sobre você..." 
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Segurança</CardTitle>
              </div>
              <CardDescription>
                Gerencie sua senha e configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="twoFactor" 
                  checked={formData.twoFactor}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, twoFactor: checked }))}
                />
                <Label htmlFor="twoFactor">Autenticação de dois fatores</Label>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" />
                    <div>
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, email: checked }
                    }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4" />
                    <div>
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, push: checked }
                    }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4" />
                    <div>
                      <Label>Notificações SMS</Label>
                      <p className="text-sm text-muted-foreground">Receba alertas importantes por SMS</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, sms: checked }
                    }))}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" />
                    <div>
                      <Label>Emails de Marketing</Label>
                      <p className="text-sm text-muted-foreground">Receba dicas e novidades sobre vendas</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.notifications.marketing}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, marketing: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aparência */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Aparência</CardTitle>
              </div>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select 
                  value={formData.theme} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sistema */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Sistema</CardTitle>
              </div>
              <CardDescription>
                Configurações avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="autoBackup" 
                  checked={formData.autoBackup}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoBackup: checked }))}
                />
                <Label htmlFor="autoBackup">Backup automático</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="analytics" 
                  checked={formData.analytics}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, analytics: checked }))}
                />
                <Label htmlFor="analytics">Permitir coleta de dados de uso</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="betaFeatures" 
                  checked={formData.betaFeatures}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, betaFeatures: checked }))}
                />
                <Label htmlFor="betaFeatures">Participar do programa beta</Label>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Versão do Sistema</Label>
                <p className="text-sm text-muted-foreground">v1.2.3 - Última atualização: 15/01/2024</p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleCancelSettings}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}