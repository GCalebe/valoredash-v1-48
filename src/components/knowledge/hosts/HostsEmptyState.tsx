import React from 'react';
import { User } from 'lucide-react';

interface HostsEmptyStateProps {
  title: string;
  description: string;
}

const HostsEmptyState: React.FC<HostsEmptyStateProps> = ({ title, description }) => {
  return (
    <div className="text-center py-12">
      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default HostsEmptyState;


