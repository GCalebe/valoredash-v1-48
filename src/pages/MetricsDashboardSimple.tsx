import React from "react";
import { LineChart } from "lucide-react";
// PageTest component was removed

const MetricsDashboardSimple = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header Simples */}
      <header className="bg-blue-600 text-white shadow-md p-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6" />
          <h1 className="text-xl font-bold">Dashboard de Métricas Teste</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            ✅ Página de Métricas Carregada com Sucesso!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Esta é uma versão simplificada da página de métricas para testar se a estrutura básica está funcionando.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Total de Conversas</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">340</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Taxa de Resposta</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">85%</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Total de Clientes</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">120</p>
            </div>
          </div>
        </div>
        
        {/* Componente de teste */}
        {/* PageTest component was removed */}
      </main>
    </div>
  );
};

export default MetricsDashboardSimple;