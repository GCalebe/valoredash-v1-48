import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Bug,
  Database,
  User,
  Settings,
  Navigation
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: unknown;
}

const DiagnosticResultItem: React.FC<{ result: DiagnosticResult; getStatusIcon: (status: string) => JSX.Element; getStatusColor: (status: string) => string; }> = ({ result, getStatusIcon, getStatusColor }) => (
  <div className={`p-3 rounded-md border ${getStatusColor(result.status)}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {getStatusIcon(result.status)}
        <span className="font-semibold">{result.test}</span>
      </div>
      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>{result.status}</Badge>
    </div>
    <p className="text-sm text-muted-foreground ml-6">{result.message}</p>
    {result.details && (
      <pre className="mt-2 ml-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-x-auto">
        {JSON.stringify(result.details, null, 2)}
      </pre>
    )}
  </div>
);

const runAuthDiagnostics = (user, session, userProfile, isAdmin, authLoading): DiagnosticResult[] => [
  {
    category: 'Auth',
    test: 'User Authentication',
    status: user ? 'success' : 'error',
    message: user ? 'Usuário autenticado' : 'Usuário não autenticado',
    details: { user: user?.email, isAdmin, authLoading }
  },
  {
    category: 'Auth',
    test: 'Session Status',
    status: session ? 'success' : 'warning',
    message: session ? 'Sessão ativa' : 'Sem sessão ativa',
    details: { sessionExists: !!session }
  },
  {
    category: 'Auth',
    test: 'User Profile',
    status: userProfile ? 'success' : 'warning',
    message: userProfile ? 'Perfil carregado' : 'Perfil não carregado',
    details: userProfile
  },
];

const runNavDiagnostics = (location): DiagnosticResult[] => [
  {
    category: 'Navigation',
    test: 'Current Route',
    status: 'info',
    message: `Rota atual: ${location.pathname}`,
    details: { pathname: location.pathname, search: location.search, hash: location.hash }
  }
];

const runEnvDiagnostics = (): DiagnosticResult[] => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***HIDDEN***' : undefined,
    VITE_ENV: import.meta.env.VITE_ENV
  };
  return [
    {
      category: 'Environment',
      test: 'Environment Variables',
      status: envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY ? 'success' : 'error',
      message: envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY ? 'Variáveis de ambiente OK' : 'Variáveis de ambiente faltando',
      details: envVars
    }
  ];
};

const DiagnosticPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, userProfile, isLoading: authLoading, isAdmin } = useAuth();
  const { settings } = useThemeSettings();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<unknown>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    results.push(...runAuthDiagnostics(user, session, userProfile, isAdmin, authLoading));
    results.push(...runNavDiagnostics(location));
    results.push(...runEnvDiagnostics());

    // Test 4: Theme Settings
    results.push({
      category: 'Theme',
      test: 'Theme Configuration',
      status: settings ? 'success' : 'error',
      message: settings ? 'Configurações de tema carregadas' : 'Erro nas configurações de tema',
      details: settings
    });

    // Test 6: Supabase Connection
    try {
      const { data, error } = await supabase.from('contacts').select('count', { count: 'exact', head: true });
      results.push({
        category: 'Database',
        test: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? `Erro de conexão: ${error.message}` : 'Conexão com Supabase OK',
        details: { error, count: data }
      });
      setSupabaseStatus({ connected: !error, error });
    } catch (err) {
      results.push({
        category: 'Database',
        test: 'Supabase Connection',
        status: 'error',
        message: `Erro de conexão: ${err}`,
        details: { error: err }
      });
      setSupabaseStatus({ connected: false, error: err });
    }

    // Test 8: Local Storage
    const mockAuthData = localStorage.getItem('mockAuthData');
    results.push({
      category: 'Storage',
      test: 'Local Storage',
      status: mockAuthData ? 'info' : 'warning',
      message: mockAuthData ? 'Dados de auth mock encontrados' : 'Sem dados de auth mock',
      details: { hasMockAuth: !!mockAuthData }
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  const testNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Erro na navegação:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const groupedDiagnostics = diagnostics.reduce((acc, diagnostic) => {
    if (!acc[diagnostic.category]) {
      acc[diagnostic.category] = [];
    }
    acc[diagnostic.category].push(diagnostic);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Painel de Diagnóstico - Comunicação entre Páginas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Rota: {location.pathname}</Badge>
          <Badge variant={user ? 'default' : 'destructive'}>
            {user ? 'Autenticado' : 'Não autenticado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
            <TabsTrigger value="navigation">Navegação</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnostics" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRunning ? 'Executando...' : 'Executar Diagnósticos'}
              </Button>
            </div>

            {Object.entries(groupedDiagnostics).map(([category, tests]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {category === 'Auth' && <User className="h-4 w-4" />}
                  {category === 'Database' && <Database className="h-4 w-4" />}
                  {category === 'Navigation' && <Navigation className="h-4 w-4" />}
                  {category === 'Theme' && <Settings className="h-4 w-4" />}
                  {category}
                </h3>
                {tests.map((test, index) => (
                  <DiagnosticResultItem 
                    key={index} 
                    result={test} 
                    getStatusIcon={getStatusIcon} 
                    getStatusColor={getStatusColor} 
                  />
                ))}
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="navigation" className="space-y-4">
            <NavigationTestTab testNavigation={testNavigation} location={location} />
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Estado da Autenticação</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify({ user: user?.email, isAdmin, authLoading, hasSession: !!session }, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Configurações de Tema</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(settings, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Status do Supabase</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(supabaseStatus, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
