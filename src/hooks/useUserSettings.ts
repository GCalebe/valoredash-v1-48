// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

interface UserSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string | number | boolean | object | null;
  created_at: string;
  updated_at: string;
}

interface SettingUpdate {
  key: string;
  value: string | number | boolean | object | null;
}

// Tipos de configurações comuns
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: 'pt' | 'en' | 'es';
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard?: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
  chat?: {
    auto_save: boolean;
    show_timestamps: boolean;
    message_preview: boolean;
  };
  privacy?: {
    profile_visibility: 'public' | 'private';
    activity_tracking: boolean;
  };
}

export function useUserSettings() {
  const [settings, setSettings] = useState<Record<string, string | number | boolean | object | null>>({});
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Carregar todas as configurações do usuário
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        return;
      }

      // Converter array de configurações em objeto
      const settingsObject = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string | number | boolean | object | null>);

      setSettings(settingsObject);
      setInitialized(true);
      console.log(`✅ ${data?.length || 0} configurações carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar uma configuração específica
  const saveSetting = useCallback(async (key: string, value: string | number | boolean | object | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        throw error;
      }

      // Atualizar estado local
      setSettings(prev => ({ ...prev, [key]: value }));
      console.log(`✅ Configuração salva: ${key}`);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      return { success: false, error };
    }
  }, []);

  // Salvar múltiplas configurações
  const saveSettings = useCallback(async (updates: SettingUpdate[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const settingsData = updates.map(update => ({
        user_id: user.id,
        setting_key: update.key,
        setting_value: update.value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, {
          onConflict: 'user_id,setting_key'
        });

      if (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        throw error;
      }

      // Atualizar estado local
      const updatesObject = updates.reduce((acc, update) => {
        acc[update.key] = update.value;
        return acc;
      }, {} as Record<string, string | number | boolean | object | null>);
      
      setSettings(prev => ({ ...prev, ...updatesObject }));
      console.log(`✅ ${updates.length} configurações salvas`);
      
      toast({
        title: "Configurações salvas",
        description: `${updates.length} configurações foram atualizadas com sucesso.`,
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [toast]);

  // Obter uma configuração específica
  const getSetting = useCallback((key: string, defaultValue?: string | number | boolean | object | null) => {
    return settings[key] ?? defaultValue;
  }, [settings]);

  // Remover uma configuração
  const removeSetting = useCallback(async (key: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('setting_key', key);

      if (error) {
        console.error('❌ Erro ao remover configuração:', error);
        throw error;
      }

      // Atualizar estado local
      setSettings(prev => {
        const newSettings = { ...prev };
        delete newSettings[key];
        return newSettings;
      });
      
      console.log(`✅ Configuração removida: ${key}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erro ao remover configuração:', error);
      return { success: false, error };
    }
  }, []);

  // Resetar todas as configurações
  const resetAllSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao resetar configurações:', error);
        throw error;
      }

      setSettings({});
      console.log('✅ Todas as configurações foram resetadas');
      
      toast({
        title: "Configurações resetadas",
        description: "Todas as configurações foram restauradas para os valores padrão.",
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Erro ao resetar configurações:', error);
      toast({
        title: "Erro ao resetar configurações",
        description: "Não foi possível resetar as configurações.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [toast]);

  // Hooks para configurações específicas comuns
  const useTheme = () => {
    const theme = getSetting('theme', 'system') as 'light' | 'dark' | 'system';
    const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
      saveSetting('theme', newTheme);
    };
    return { theme, setTheme };
  };

  const useLanguage = () => {
    const language = getSetting('language', 'pt') as 'pt' | 'en' | 'es';
    const setLanguage = (newLanguage: 'pt' | 'en' | 'es') => {
      saveSetting('language', newLanguage);
    };
    return { language, setLanguage };
  };

  const useNotifications = () => {
    const notifications = getSetting('notifications', {
      email: true,
      push: true,
      sms: false
    });
    const setNotifications = (newNotifications: { email: boolean; push: boolean; sms: boolean }) => {
      saveSetting('notifications', newNotifications);
    };
    return { notifications, setNotifications };
  };

  const useChatSettings = () => {
    const chatSettings = getSetting('chat', {
      auto_save: true,
      show_timestamps: true,
      message_preview: true
    });
    const setChatSettings = (newChatSettings: { auto_save: boolean; show_timestamps: boolean; message_preview: boolean }) => {
      saveSetting('chat', newChatSettings);
    };
    return { chatSettings, setChatSettings };
  };

  // Carregar configurações ao montar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Recarregar configurações quando o usuário mudar
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadSettings();
      } else if (event === 'SIGNED_OUT') {
        setSettings({});
        setInitialized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSettings]);

  return {
    settings,
    loading,
    initialized,
    loadSettings,
    saveSetting,
    saveSettings,
    getSetting,
    removeSetting,
    resetAllSettings,
    // Hooks específicos
    useTheme,
    useLanguage,
    useNotifications,
    useChatSettings
  };
}

export type { UserSetting, SettingUpdate };