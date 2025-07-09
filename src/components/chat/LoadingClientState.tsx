import React from 'react';

const LoadingClientState = React.memo(() => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-sm">Carregando informações...</p>
    </div>
  );
});

LoadingClientState.displayName = 'LoadingClientState';

export default LoadingClientState;