import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOptimizedHosts } from "@/hooks/useOptimizedHosts";
import { useProducts } from "@/hooks/useProducts";

interface ServiceSelectionTabProps {
  state: any;
  updateState: (updates: any) => void;
  constants: any;
  onNext: () => void;
  onPrevious: () => void;
}

export function ServiceSelectionTab({
  state,
  updateState,
  constants,
  onNext,
  onPrevious,
}: ServiceSelectionTabProps) {
  const { hosts, loading: hostsLoading } = useOptimizedHosts();
  const { products, loading: productsLoading } = useProducts();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="service">Produto/Serviço *</Label>
        <Select 
          value={state.selectedService} 
          onValueChange={(value) => updateState({ selectedService: value })}
          disabled={productsLoading}
        >
          <SelectTrigger id="service" className={state.errors.service ? "border-destructive" : ""}>
            <SelectValue placeholder={productsLoading ? "Carregando produtos..." : "Selecione um produto/serviço"} />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.name}>
                {product.name} {product.price > 0 && `- R$ ${product.price.toFixed(2)}`}
              </SelectItem>
            ))}
            {products.length === 0 && !productsLoading && (
              <div className="p-2 text-sm text-gray-500 text-center">
                Nenhum produto/serviço encontrado
              </div>
            )}
          </SelectContent>
        </Select>
        {state.errors.service && (
          <p className="text-sm text-destructive">{state.errors.service}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="collaborator">Anfitrião *</Label>
        <Select 
          value={state.collaborator} 
          onValueChange={(value) => updateState({ collaborator: value })}
          disabled={hostsLoading}
        >
          <SelectTrigger id="collaborator" className={state.errors.collaborator ? "border-destructive" : ""}>
            <SelectValue placeholder={hostsLoading ? "Carregando anfitriões..." : "Selecione um anfitrião"} />
          </SelectTrigger>
          <SelectContent>
            {(hosts || []).map((host) => (
              <SelectItem key={host.id} value={host.name}>
                {host.name} - {host.role}
              </SelectItem>
            ))}
            {hosts.length === 0 && !hostsLoading && (
              <div className="p-2 text-sm text-gray-500 text-center">
                Nenhum anfitrião encontrado
              </div>
            )}
          </SelectContent>
        </Select>
        {state.errors.collaborator && (
          <p className="text-sm text-destructive">{state.errors.collaborator}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duração</Label>
        <Select 
          value={state.selectedDuration.toString()} 
          onValueChange={(value) => updateState({ selectedDuration: parseInt(value) })}
        >
          <SelectTrigger id="duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(constants.DURATIONS || []).map((duration: any) => (
              <SelectItem key={duration.value} value={duration.value.toString()}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </>
  );
}