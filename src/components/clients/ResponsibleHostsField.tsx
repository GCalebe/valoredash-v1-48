import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useOptimizedHosts } from "@/hooks/useOptimizedHosts";
import { Contact } from "@/types/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ResponsibleHostsFieldProps {
  newContact: Partial<Contact>;
  onInputChange: (field: keyof Contact, value: unknown) => void;
}

const ResponsibleHostsField = React.memo(({ newContact, onInputChange }: ResponsibleHostsFieldProps) => {
  const { hosts, loading } = useOptimizedHosts();
  
  const handleHostToggle = (hostId: string, checked: boolean) => {
    const currentHosts = newContact.responsibleHosts || [];
    
    if (checked) {
      // Adicionar host se não estiver na lista
      if (!currentHosts.includes(hostId)) {
        onInputChange("responsibleHosts", [...currentHosts, hostId]);
      }
    } else {
      // Remover host da lista
      onInputChange("responsibleHosts", currentHosts.filter(id => id !== hostId));
    }
  };

  if (loading) {
    return (
      <div>
        <Label className="text-gray-700 dark:text-gray-300">
          Anfitrião Responsável
        </Label>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!hosts || hosts.length === 0) {
    return (
      <div>
        <Label className="text-gray-700 dark:text-gray-300">
          Anfitrião Responsável
        </Label>
        <p className="text-sm text-gray-500 mt-2">
          Nenhum anfitrião encontrado. Cadastre anfitriões na seção de Hosts primeiro.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Label className="text-gray-700 dark:text-gray-300">
        Anfitrião Responsável
      </Label>
      <div className="space-y-3 mt-3 max-h-40 overflow-y-auto border border-input rounded-md p-3 bg-background">
        {hosts.map((host) => (
          <div key={host.id} className="flex items-center space-x-3">
            <Checkbox
              id={`host-${host.id}`}
              checked={newContact.responsibleHosts?.includes(host.id) || false}
              onCheckedChange={(checked) => handleHostToggle(host.id, checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`host-${host.id}`}
              className="text-sm font-normal cursor-pointer flex-1 text-foreground"
            >
              <span className="font-medium">{host.name}</span>
              {host.role && (
                <span className="text-muted-foreground ml-2">- {host.role}</span>
              )}
            </Label>
          </div>
        ))}
      </div>
      {newContact.responsibleHosts && newContact.responsibleHosts.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {newContact.responsibleHosts.length} anfitrião(ões) selecionado(s)
        </p>
      )}
    </div>
  );
});

ResponsibleHostsField.displayName = 'ResponsibleHostsField';

export default ResponsibleHostsField;