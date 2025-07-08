import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

const PageTest: React.FC = () => {
  const { user, isLoading, session } = useAuth();
  const location = useLocation();

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg m-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        🔍 Teste de Página
      </h2>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Rota atual:</span>
          <span className="text-blue-600 dark:text-blue-400">{location.pathname}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Status de autenticação:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isLoading ? 'bg-yellow-100 text-yellow-800' :
            user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isLoading ? 'Carregando...' : user ? 'Autenticado' : 'Não autenticado'}
          </span>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Usuário:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {user.email || 'Email não disponível'}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Sessão ativa:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            session ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {session ? 'Sim' : 'Não'}
          </span>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ✅ Esta página está renderizando corretamente!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageTest;