import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { SettingsFormData } from "../types";

interface SystemCardProps {
  formData: SettingsFormData;
  setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
}

export function SystemCard({ formData, setFormData }: SystemCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Sistema</CardTitle>
        </div>
        <CardDescription>Configurações avançadas do sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="autoBackup"
            checked={formData.autoBackup}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, autoBackup: checked }))}
          />
        <Label htmlFor="autoBackup">Backup automático</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="analytics"
            checked={formData.analytics}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, analytics: checked }))}
          />
          <Label htmlFor="analytics">Permitir coleta de dados de uso</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="betaFeatures"
            checked={formData.betaFeatures}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, betaFeatures: checked }))}
          />
          <Label htmlFor="betaFeatures">Participar do programa beta</Label>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Versão do Sistema</Label>
          <p className="text-sm text-muted-foreground">v1.2.3 - Última atualização: 15/01/2024</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SystemCard;


