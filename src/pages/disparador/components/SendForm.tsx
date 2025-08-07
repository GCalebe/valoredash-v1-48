// @ts-nocheck
import React, { RefObject } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, FileText, Trash2, Upload } from "lucide-react";

interface SendFormProps {
  instances: Array<{ id: string; name: string; status: string }>;
  selectedInstance: string;
  onChangeInstance: (id: string) => void;
  message: string;
  onChangeMessage: (v: string) => void;
  mediaFile: File | null;
  onChooseFile: () => void;
  onRemoveFile: () => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  enableScheduling: boolean;
  onToggleScheduling: (v: boolean) => void;
  scheduleDate: string;
  onChangeScheduleDate: (v: string) => void;
  scheduleTime: string;
  onChangeScheduleTime: (v: string) => void;
  contactsCount: number;
  isLoading: boolean;
  onSubmit: () => void;
}

const SendForm: React.FC<SendFormProps> = ({
  instances,
  selectedInstance,
  onChangeInstance,
  message,
  onChangeMessage,
  mediaFile,
  onChooseFile,
  onRemoveFile,
  onFileInputChange,
  fileInputRef,
  enableScheduling,
  onToggleScheduling,
  scheduleDate,
  onChangeScheduleDate,
  scheduleTime,
  onChangeScheduleTime,
  contactsCount,
  isLoading,
  onSubmit,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Configurar Disparo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="selectInstance">Instância</Label>
          <Select value={selectedInstance} onValueChange={onChangeInstance}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma instância" />
            </SelectTrigger>
            <SelectContent>
              {instances.filter(inst => inst.status === 'connected').map((instance) => (
                <SelectItem key={instance.id} value={instance.id}>
                  {instance.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            rows={4}
          />
          <p className="text-sm text-muted-foreground mt-1">{message.length}/1000 caracteres</p>
        </div>

        <div>
          <Label>Mídia (Opcional)</Label>
          <div className="mt-2">
            {mediaFile ? (
              <div className="flex items-center gap-2 p-2 border rounded">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{mediaFile.name}</span>
                <Button variant="ghost" size="sm" onClick={onRemoveFile}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={onChooseFile} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Selecionar Arquivo
              </Button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf" onChange={onFileInputChange} className="hidden" />
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <input type="checkbox" id="enableScheduling" checked={enableScheduling} onChange={(e) => onToggleScheduling(e.target.checked)} className="rounded" />
              <label htmlFor="enableScheduling" className="cursor-pointer">Agendar este disparo</label>
            </CardTitle>
          </CardHeader>
          {enableScheduling && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleDate">Data</Label>
                  <Input id="scheduleDate" type="date" value={scheduleDate} onChange={(e) => onChangeScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label htmlFor="scheduleTime">Hora</Label>
                  <Input id="scheduleTime" type="time" value={scheduleTime} onChange={(e) => onChangeScheduleTime(e.target.value)} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">O disparo será executado automaticamente na data/hora especificada</p>
            </CardContent>
          )}
        </Card>

        <Button onClick={onSubmit} disabled={isLoading || !selectedInstance || !message.trim() || contactsCount === 0} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          {isLoading ? 'Enviando...' : enableScheduling ? 'Agendar Disparo' : `Enviar para ${contactsCount} contatos`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SendForm;


