// @ts-nocheck
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import UserProfileCard from './settings/components/UserProfileCard';
import SecurityCard from './settings/components/SecurityCard';
import NotificationsCard from './settings/components/NotificationsCard';
import AppearanceCard from './settings/components/AppearanceCard';
import SystemCard from './settings/components/SystemCard';
import ActionButtons from './settings/components/ActionButtons';
import type { SettingsFormData } from './settings/types';

export default function Settings() {
  const { toast } = useToast();
  const { loading, saveSettings, getSetting, initialized } = useUserSettings();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState<SettingsFormData>({
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
      // Logamos o erro para rastreabilidade
      // eslint-disable-next-line no-console
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      throw error;
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
          <p className="text-muted-foreground">Gerencie suas preferências e configurações do sistema</p>
        </div>
        <div className="grid gap-6">
          <UserProfileCard formData={formData} setFormData={setFormData} />
          <SecurityCard
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          <NotificationsCard formData={formData} setFormData={setFormData} />
          <AppearanceCard formData={formData} setFormData={setFormData} />
          <SystemCard formData={formData} setFormData={setFormData} />
          <ActionButtons loading={loading || isSaving} onSave={handleSaveSettings} onCancel={handleCancelSettings} />
        </div>
      </div>
    </AppLayout>
  );
}