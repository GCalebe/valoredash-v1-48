import React from 'react';
import ConnectionCard from './ConnectionCard';

interface ConnectionCardsListProps {
  connections: any[];
  onShowQrCode: (id: string) => void;
  onDisconnect: (id: string) => void;
}

const ConnectionCardsList: React.FC<ConnectionCardsListProps> = ({ connections, onShowQrCode, onDisconnect }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {connections.map((connection) => (
        <ConnectionCard key={connection.id} connection={connection} onShowQrCode={onShowQrCode} onDisconnect={onDisconnect} />
      ))}
    </div>
  );
};

export default ConnectionCardsList;


