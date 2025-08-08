import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, X } from 'lucide-react';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import { ConnectedContent, ConnectingContent } from './ConnectionContent';

interface ConnectionCardProps {
  connection: any;
  onShowQrCode: (id: string) => void;
  onDisconnect: (id: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onShowQrCode, onDisconnect }) => {
  return (
    <Card className="bg-gray-800 text-white border-gray-700">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-xl">{connection.name}</CardTitle>
          <p className="text-gray-400">{connection.displayName}</p>
        </div>
        <ConnectionStatusBadge status={connection.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        {connection.status === 'connected' ? (
          <ConnectedContent connection={connection} />
        ) : (
          <ConnectingContent connection={connection} />
        )}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-900/20" onClick={() => onShowQrCode(connection.id)}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" className="flex-1 border-red-500 text-red-400 hover:bg-red-900/20" onClick={() => onDisconnect(connection.id)}>
            <X className="h-4 w-4 mr-2" />
            Desconectar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;


