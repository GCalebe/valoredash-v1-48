import React from "react";
import { MessageCircle } from "lucide-react";
import PageTest from "@/components/PageTest";

const ChatsDashboardSimple = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header Simples */}
      <header className="bg-green-600 text-white shadow-md p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          <h1 className="text-xl font-bold">Dashboard de Chats Teste</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            💬 Página de Chats Carregada com Sucesso!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Esta é uma versão simplificada da página de chats para testar se a estrutura básica está funcionando.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Conversas Ativas</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">25</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Mensagens Hoje</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">156</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Últimas Conversas</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                <span className="text-gray-800 dark:text-gray-200">Cliente A</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">há 5 min</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                <span className="text-gray-800 dark:text-gray-200">Cliente B</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">há 12 min</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                <span className="text-gray-800 dark:text-gray-200">Cliente C</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">há 1 hora</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Componente de teste */}
        <PageTest />
      </main>
    </div>
  );
};

export default ChatsDashboardSimple;