import React, { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  HardDrive, 
  Image, 
  FileVideo, 
  FileAudio,
  File,
  FolderOpen,
  Info
} from "lucide-react";
import { FileMetadata } from "@/types/file";
import { useClientFiles } from "@/hooks/useClientFiles";
import ClientFilesList from "./ClientFilesList";

interface ClientFilesTabProps {
  clientId?: string;
  onFileUpdate?: (files: FileMetadata[]) => void;
  readOnly?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return FileVideo;
  if (type.startsWith('audio/')) return FileAudio;
  return File;
};

const getFileTypeColor = (type: string) => {
  if (type.startsWith('image/')) return 'text-blue-600';
  if (type.startsWith('video/')) return 'text-purple-600';
  if (type.startsWith('audio/')) return 'text-green-600';
  if (type.includes('pdf')) return 'text-red-600';
  return 'text-gray-600';
};

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

  // Organize files by type
  const filesByType = files.reduce((acc, file) => {
    const category = file.type.startsWith('image/') ? 'images' : 
                    file.type.startsWith('video/') ? 'videos' :
                    file.type.startsWith('audio/') ? 'audio' : 'documents';
    if (!acc[category]) acc[category] = [];
    acc[category].push(file);
    return acc;
  }, {} as Record<string, FileMetadata[]>);

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

  const acceptedTypes = [
    { type: 'Documentos', extensions: 'PDF, DOC, DOCX, TXT', icon: FileText },
    { type: 'Imagens', extensions: 'JPG, PNG, GIF, WebP', icon: Image },
    { type: 'Vídeos', extensions: 'MP4, MOV, AVI', icon: FileVideo },
    { type: 'Áudio', extensions: 'MP3, WAV, AAC', icon: FileAudio },
  ];

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Biblioteca de Mídia</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie documentos, imagens, vídeos e outros arquivos do cliente
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <FolderOpen className="h-3 w-3" />
            {files.length} arquivo{files.length !== 1 ? 's' : ''}
          </Badge>
          {files.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
            </Badge>
          )}
        </div>
      </div>

      {/* Storage usage card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4" />
              Uso de Armazenamento
            </CardTitle>
            <Badge variant={storagePercentage > 90 ? 'destructive' : 'secondary'}>
              {Math.round(storagePercentage)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress 
              value={storagePercentage} 
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatFileSize(storageUsage.used)} usado</span>
              <span>{formatFileSize(storageUsage.max)} total</span>
            </div>
            {storagePercentage > 90 && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                Armazenamento quase cheio! Considere remover arquivos antigos.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload section */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Enviar Arquivos
            </CardTitle>
            <CardDescription>
              Arraste arquivos ou clique para selecionar. Limite: {formatFileSize(maxFileSize)} por arquivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and drop area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isUploading}
              />

              <div className="space-y-4">
                <Upload className={`h-10 w-10 mx-auto transition-colors ${
                  dragActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
                
                <div>
                  <p className="text-lg font-medium mb-1">
                    {dragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    ou{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary hover:underline font-medium"
                      disabled={isUploading}
                    >
                      clique para selecionar
                    </button>
                  </p>
                </div>

                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-background p-4 rounded-lg shadow-lg">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="font-medium">Enviando arquivo...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Supported file types */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {acceptedTypes.map((fileType) => {
                const Icon = fileType.icon;
                return (
                  <div 
                    key={fileType.type}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs">
                      <div className="font-medium">{fileType.type}</div>
                      <div className="text-muted-foreground">{fileType.extensions}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Dicas de upload:</p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Tamanho máximo: {formatFileSize(maxFileSize)} por arquivo</li>
                  <li>• Você pode selecionar múltiplos arquivos</li>
                  <li>• Arquivos são organizados automaticamente por tipo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files section */}
      {files.length > 0 ? (
        <div className="space-y-4">
          {/* File type sections */}
          {Object.entries(filesByType).map(([category, categoryFiles]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {category === 'images' && <Image className="h-4 w-4" />}
                  {category === 'videos' && <FileVideo className="h-4 w-4" />}
                  {category === 'audio' && <FileAudio className="h-4 w-4" />}
                  {category === 'documents' && <FileText className="h-4 w-4" />}
                  {category === 'images' ? 'Imagens' : 
                   category === 'videos' ? 'Vídeos' :
                   category === 'audio' ? 'Áudio' : 'Documentos'} 
                  <Badge variant="secondary" className="ml-auto">
                    {categoryFiles.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientFilesList
                  files={categoryFiles}
                  readOnly={readOnly}
                  formatFileSize={formatFileSize}
                  onDownload={downloadFile}
                  onDelete={deleteFile}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum arquivo enviado</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {readOnly 
                ? 'Este cliente ainda não possui arquivos de mídia.'
                : 'Comece enviando documentos, imagens ou outros arquivos para organizar a biblioteca de mídia do cliente.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientFilesTab;