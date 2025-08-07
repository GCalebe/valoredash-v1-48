// @ts-nocheck
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Eye, EyeOff, Plus, Server, Trash2 } from "lucide-react";

interface InstancesManagerProps {
  instances: Array<{ id: string; name: string; apikey: string; status: string }>;
  newInstanceName: string;
  newInstanceAPIKEY: string;
  showAPIKEY: Record<string, boolean>;
  isLoading: boolean;
  onChangeNewInstanceName: (v: string) => void;
  onChangeNewInstanceAPIKEY: (v: string) => void;
  onAddInstance: () => void;
  onToggleApiKey: (instanceId: string) => void;
  onRemoveInstance: (instanceId: string) => void;
}

const InstancesManager: React.FC<InstancesManagerProps> = ({
  instances,
  newInstanceName,
  newInstanceAPIKEY,
  showAPIKEY,
  isLoading,
  onChangeNewInstanceName,
  onChangeNewInstanceAPIKEY,
  onAddInstance,
  onToggleApiKey,
  onRemoveInstance,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Gerenciar Instâncias WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para nova instância */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="instanceName">Nome da Instância</Label>
            <Input
              id="instanceName"
              value={newInstanceName}
              onChange={(e) => onChangeNewInstanceName(e.target.value)}
              placeholder="Ex: WhatsApp Principal"
            />
          </div>
          <div>
            <Label htmlFor="instanceAPIKEY">APIKEY</Label>
            <Input
              id="instanceAPIKEY"
              type="password"
              value={newInstanceAPIKEY}
              onChange={(e) => onChangeNewInstanceAPIKEY(e.target.value)}
              placeholder="Digite a APIKEY"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onAddInstance} disabled={isLoading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </div>

        {/* Lista de instâncias */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Instâncias Cadastradas</h3>
            <Badge variant="secondary">
              {instances.filter(inst => inst.status === 'connected').length} ativas
            </Badge>
          </div>
          {instances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma instância cadastrada</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {instances.map((instance) => (
                <Card key={instance.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        instance.status === 'connected' ? 'bg-green-500' :
                        instance.status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h4 className="font-semibold">{instance.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Key className="h-3 w-3" />
                          {showAPIKEY[instance.id] ? instance.apikey : '••••••••••••'}
                          <Button variant="ghost" size="sm" onClick={() => onToggleApiKey(instance.id)}>
                            {showAPIKEY[instance.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={instance.status === 'connected' ? 'default' : 'secondary'}>
                        {instance.status === 'connected' ? 'Conectado' :
                          instance.status === 'connecting' ? 'Conectando' : 'Desconectado'}
                      </Badge>
                      <Button variant="destructive" size="sm" onClick={() => onRemoveInstance(instance.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstancesManager;


