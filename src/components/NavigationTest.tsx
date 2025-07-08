import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Navigation } from "lucide-react";

interface NavigationTestResult {
  route: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

const NavigationTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState<NavigationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(location.pathname);

  const testRoutes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/metrics', name: 'Métricas' },
    { path: '/chats', name: 'Chats' },
    { path: '/knowledge', name: 'Conhecimento' },
    { path: '/clients', name: 'Clientes' },
    { path: '/evolution', name: 'Evolução' },
    { path: '/schedule', name: 'Agenda' },
    { path: '/admin', name: 'Admin' },
  ];

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  const testNavigation = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const route of testRoutes) {
      try {
        // Adiciona resultado pendente
        setTestResults(prev => [...prev, {
          route: route.path,
          status: 'pending',
          message: `Testando navegação para ${route.name}...`
        }]);

        // Navega para a rota
        navigate(route.path);
        
        // Aguarda um pouco para a navegação completar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verifica se a navegação foi bem-sucedida
        const success = window.location.pathname === route.path;
        
        setTestResults(prev => prev.map(result => 
          result.route === route.path 
            ? {
                ...result,
                status: success ? 'success' : 'error',
                message: success 
                  ? `✅ Navegação para ${route.name} bem-sucedida`
                  : `❌ Falha na navegação para ${route.name}`
              }
            : result
        ));
        
      } catch (error) {
        setTestResults(prev => prev.map(result => 
          result.route === route.path 
            ? {
                ...result,
                status: 'error',
                message: `❌ Erro na navegação para ${route.name}: ${error}`
              }
            : result
        ));
      }
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Teste de Navegação entre Páginas
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Rota atual: <Badge variant="outline">{currentRoute}</Badge>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testNavigation} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isRunning ? 'Testando...' : 'Iniciar Teste'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={isRunning}
          >
            Limpar Resultados
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Resultados do Teste:</h3>
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    result.status === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : result.status === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {result.status === 'success' && <CheckCircle className="h-4 w-4" />}
                  {result.status === 'error' && <XCircle className="h-4 w-4" />}
                  {result.status === 'pending' && (
                    <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  )}
                  <span>{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <h4 className="font-medium mb-2">Rotas Testadas:</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            {testRoutes.map((route, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">{route.path}</span>
                <span>→</span>
                <span>{route.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationTest;