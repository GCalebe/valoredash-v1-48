import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, HardDrive } from "lucide-react";
import { FileMetadata } from "@/types/file";
import { useClientFiles } from "@/hooks/useClientFiles";
import ClientFilesList from "./ClientFilesList";

interface ClientFilesTabProps {
  clientId?: string;
  onFileUpdate?: (files: FileMetadata[]) => void;
  readOnly?: boolean;
}

const ClientFilesTab: React.FC<ClientFilesTabProps> = ({ clientId, onFileUpdate, readOnly = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isUploading,
    storageUsage,
    storagePercentage,
    maxFileSize,
    handleFileSelect,
    deleteFile,
    downloadFile,
    formatFileSize,
  } = useClientFiles({ clientId, onFileUpdate });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Arquivos</h3>
          <p className="text-sm text-muted-foreground">Gerenciar arquivos do cliente</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {files.length} arquivo(s)
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <HardDrive className="h-4 w-4" />
            Uso de Armazenamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usado: {formatFileSize(storageUsage.used)}</span>
              <span>Limite: {formatFileSize(storageUsage.max)}</span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            {storagePercentage > 90 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Armazenamento quase cheio
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Enviar Arquivo
            </CardTitle>
            <CardDescription>
              Arraste um arquivo ou clique para selecionar (máx. {formatFileSize(maxFileSize)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isUploading}
              />

              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste arquivos aqui ou{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                  disabled={isUploading}
                >
                  clique para selecionar
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Tipos suportados: PDF, DOC, DOCX, TXT, JPG, PNG
              </p>
            </div>

            {isUploading && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span className="text-sm">Enviando arquivo...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ClientFilesList
        files={files}
        readOnly={readOnly}
        formatFileSize={formatFileSize}
        onDownload={downloadFile}
        onDelete={deleteFile}
      />
    </div>
  );
};

export default ClientFilesTab;
