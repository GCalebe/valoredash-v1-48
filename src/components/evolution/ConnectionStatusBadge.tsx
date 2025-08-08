import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusBadgeProps {
  status: 'connected' | 'connecting' | string;
}

const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ status }) => {
  if (status === 'connected') {
    return <Badge className="bg-green-500 text-white">Conectado</Badge>;
  }
  if (status === 'connecting') {
    return <Badge className="bg-yellow-500 text-white">Conectando</Badge>;
  }
  return null;
};

export default ConnectionStatusBadge;


