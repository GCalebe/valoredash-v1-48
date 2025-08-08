import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConfigModalProps {
  open: boolean;
  serpApiKey: string;
  whatsappBaseUrl: string;
  whatsappInstance: string;
  whatsappApiKey: string;
  onChange: (patch: Partial<{ serpApiKey: string; whatsappBaseUrl: string; whatsappInstance: string; whatsappApiKey: string }>) => void;
  onSave: () => void;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ open, serpApiKey, whatsappBaseUrl, whatsappInstance, whatsappApiKey, onChange, onSave, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Configurar APIs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="serpApiKey" className="text-sm font-medium">SerpAPI Key</label>
            <Input id="serpApiKey" type="password" placeholder="Sua chave da SerpAPI" value={serpApiKey} onChange={(e) => onChange({ serpApiKey: e.target.value })} />
          </div>
          <div>
            <label htmlFor="waBaseUrl" className="text-sm font-medium">WhatsApp Base URL</label>
            <Input id="waBaseUrl" placeholder="https://api.whatsapp.com" value={whatsappBaseUrl} onChange={(e) => onChange({ whatsappBaseUrl: e.target.value })} />
          </div>
          <div>
            <label htmlFor="waInstance" className="text-sm font-medium">WhatsApp Instance</label>
            <Input id="waInstance" placeholder="Nome da instância" value={whatsappInstance} onChange={(e) => onChange({ whatsappInstance: e.target.value })} />
          </div>
          <div>
            <label htmlFor="waApiKey" className="text-sm font-medium">WhatsApp API Key</label>
            <Input id="waApiKey" type="password" placeholder="Sua chave da API WhatsApp" value={whatsappApiKey} onChange={(e) => onChange({ whatsappApiKey: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onSave} className="flex-1">Salvar</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigModal;


