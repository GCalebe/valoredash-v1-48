import React from 'react';
import { useOptimizedHosts } from "@/hooks/useOptimizedHosts";
import { Badge } from "@/components/ui/badge";

interface ResponsibleHostsDisplayProps {
  hostIds?: string[];
  maxDisplay?: number;
  showEmpty?: boolean;
}

const ResponsibleHostsDisplay = React.memo(({ 
  hostIds = [], 
  maxDisplay = 3,
  showEmpty = true 
}: ResponsibleHostsDisplayProps) => {
  const { hosts, loading } = useOptimizedHosts();

  if (loading) {
    return <span className="text-muted-foreground">Carregando...</span>;
  }

  if (!hostIds || hostIds.length === 0) {
    return showEmpty ? (
      <span className="text-muted-foreground">Não atribuído</span>
    ) : null;
  }

  const assignedHosts = hosts.filter(host => hostIds.includes(host.id));
  
  if (assignedHosts.length === 0) {
    return showEmpty ? (
      <span className="text-muted-foreground">Não atribuído</span>
    ) : null;
  }

  const displayHosts = assignedHosts.slice(0, maxDisplay);
  const remainingCount = assignedHosts.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayHosts.map((host) => (
        <Badge 
          key={host.id} 
          variant="secondary" 
          className="text-xs truncate max-w-24"
          title={`${host.name}${host.role ? ` - ${host.role}` : ''}`}
        >
          {host.name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
});

ResponsibleHostsDisplay.displayName = 'ResponsibleHostsDisplay';

export default ResponsibleHostsDisplay;