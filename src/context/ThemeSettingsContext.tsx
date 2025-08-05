import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ThemeSettings {
  brandName: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

type ThemeSettingsContextType = {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  loading: boolean;
  initialized: boolean;
};

const defaultSettings: ThemeSettings = {
  brandName: "Valore Comercial",
  logo: null,
  primaryColor: "#1e40af",
  secondaryColor: "#f59e0b",
  accentColor: "#1e3a8a",
};

const THEME_SETTINGS_KEY = 'theme_settings';

const ThemeSettingsContext = createContext<
  ThemeSettingsContextType | undefined
>(undefined);

export function ThemeSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { saveSetting, getSetting } = useUserSettings();
  const { toast } = useToast();

  // Verificar se usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (event === 'SIGNED_OUT') {
        // Voltar para configurações padrão quando usuário sair
        setSettings(defaultSettings);
        setInitialized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar configurações do banco ou localStorage
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Usuário autenticado: buscar do banco
        const savedSettings = getSetting(THEME_SETTINGS_KEY);
        if (savedSettings && typeof savedSettings === 'object') {
          setSettings({ ...defaultSettings, ...savedSettings });
        } else {
          // Migrar do localStorage se existir
          const localStorageSettings = localStorage.getItem("valore-theme-settings");
          if (localStorageSettings) {
            const parsedSettings = JSON.parse(localStorageSettings);
            const migratedSettings = { ...defaultSettings, ...parsedSettings };
            setSettings(migratedSettings);
            // Salvar no banco
            await saveSetting(THEME_SETTINGS_KEY, migratedSettings);
            // Limpar localStorage
            localStorage.removeItem("valore-theme-settings");
            toast({
              title: "Configurações migradas",
              description: "Suas configurações de tema foram migradas para sua conta.",
            });
          } else {
            setSettings(defaultSettings);
          }
        }
      } else {
        // Usuário não autenticado: usar localStorage como fallback
        const saved = localStorage.getItem("valore-theme-settings");
        setSettings(saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings);
      }
      setInitialized(true);
    } catch (error) {
      console.error('Erro ao carregar configurações de tema:', error);
      setSettings(defaultSettings);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getSetting, saveSetting, toast]);

  // Carregar configurações quando componente montar ou autenticação mudar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Aplicar variáveis CSS quando configurações mudarem
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--valore-blue", settings.primaryColor);
    root.style.setProperty("--valore-gold", settings.secondaryColor);
    root.style.setProperty("--valore-navy", settings.accentColor);
  }, [settings]);

  const updateSettings = useCallback(async (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      if (isAuthenticated) {
        // Salvar no banco
        await saveSetting(THEME_SETTINGS_KEY, updatedSettings);
      } else {
        // Salvar no localStorage como fallback
        localStorage.setItem("valore-theme-settings", JSON.stringify(updatedSettings));
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de tema:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de tema.",
        variant: "destructive",
      });
      // Reverter mudanças em caso de erro
      setSettings(settings);
    }
  }, [settings, isAuthenticated, saveSetting, toast]);

  const resetSettings = useCallback(async () => {
    setSettings(defaultSettings);

    try {
      if (isAuthenticated) {
        // Salvar configurações padrão no banco
        await saveSetting(THEME_SETTINGS_KEY, defaultSettings);
      } else {
        // Remover do localStorage
        localStorage.removeItem("valore-theme-settings");
      }
      toast({
        title: "Configurações resetadas",
        description: "Todas as configurações foram restauradas para o padrão.",
      });
    } catch (error) {
      console.error('Erro ao resetar configurações de tema:', error);
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível resetar as configurações de tema.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, saveSetting, toast]);

  return (
    <ThemeSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, loading, initialized }}
    >
      {children}
    </ThemeSettingsContext.Provider>
  );
}

export const useThemeSettings = () => {
  const context = useContext(ThemeSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useThemeSettings must be used within a ThemeSettingsProvider",
    );
  }
  return context;
};
