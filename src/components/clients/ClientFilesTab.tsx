import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  AlertCircle,
  HardDrive,
  X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  path: string;
  url?: string;
}

interface ClientFilesTabProps {
  clientId?: string;
  onFileUpdate?: (files: FileMetadata[]) => void;
  readOnly?: boolean;
}

const ClientFilesTab: React.FC<ClientFilesTabProps> = ({
  clientId,
  onFileUpdate,
  readOnly = false,
}) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, max: 100 * 1024 * 1024 }); // 100MB default
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const maxFileSize = 10 * 1024 * 1024; // 10MB per file

  useEffect(() => {
    if (clientId) {
      loadClientFiles();
    }
    loadStorageUsage();
  }, [clientId]);

  const loadClientFiles = async () => {
    if (!clientId) return;

    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('files_metadata')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Erro ao carregar arquivos:', error);
        return;
      }

      const filesMetadata = (contact?.files_metadata as unknown as FileMetadata[]) || [];
      
      // Load URLs for files
      const filesWithUrls = await Promise.all(
        filesMetadata.map(async (file: FileMetadata) => {
          const { data } = await supabase.storage
            .from('client-files')
            .createSignedUrl(file.path, 3600); // 1 hour expiry
          
          return {
            ...file,
            url: data?.signedUrl
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    }
  };

  const loadStorageUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_storage_usage')
        .select('used_bytes, max_bytes')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar uso de storage:', error);
        return;
      }

      if (data) {
        setStorageUsage({ used: data.used_bytes, max: data.max_bytes });
      }
    } catch (error) {
      console.error('Erro ao carregar uso de storage:', error);
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    
    // Check file size
    if (file.size > maxFileSize) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${formatFileSize(maxFileSize)}`,
        variant: "destructive",
      });
      return;
    }

    // Check storage limit
    if (storageUsage.used + file.size > storageUsage.max) {
      toast({
        title: "Limite de armazenamento atingido",
        description: "Você não tem espaço suficiente para este arquivo",
        variant: "destructive",
      });
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!clientId || !user) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(fileName, file, {
          metadata: {
            size: file.size.toString(),
            originalName: file.name,
            contentType: file.type
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      const fileMetadata: FileMetadata = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        path: fileName
      };

      const updatedFiles = [...files, fileMetadata];
      setFiles(updatedFiles);

      // Update contact with file metadata
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ files_metadata: updatedFiles as any })
        .eq('id', clientId);

      if (updateError) {
        throw updateError;
      }

      onFileUpdate?.(updatedFiles);
      loadStorageUsage(); // Refresh storage usage

      toast({
        title: "Arquivo enviado",
        description: "O arquivo foi enviado com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileToDelete: FileMetadata) => {
    if (!clientId) return;

    try {
      const { error: deleteError } = await supabase.storage
        .from('client-files')
        .remove([fileToDelete.path]);

      if (deleteError) {
        throw deleteError;
      }

      const updatedFiles = files.filter(f => f.id !== fileToDelete.id);
      setFiles(updatedFiles);

      // Update contact with file metadata
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ files_metadata: updatedFiles as any })
        .eq('id', clientId);

      if (updateError) {
        throw updateError;
      }

      onFileUpdate?.(updatedFiles);
      loadStorageUsage(); // Refresh storage usage

      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido com sucesso",
      });

    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover o arquivo",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (file: FileMetadata) => {
    if (!file.url) {
      const { data } = await supabase.storage
        .from('client-files')
        .createSignedUrl(file.path, 3600);
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } else {
      window.open(file.url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const storagePercentage = (storageUsage.used / storageUsage.max) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Arquivos</h3>
          <p className="text-sm text-muted-foreground">
            Gerenciar arquivos do cliente
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {files.length} arquivo(s)
        </Badge>
      </div>

      {/* Storage Usage */}
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

      {/* Upload Area */}
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
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
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

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Arquivos Enviados</CardTitle>
          <CardDescription>
            Lista de todos os arquivos do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum arquivo enviado ainda
              </p>
              {!readOnly && (
                <p className="text-sm text-muted-foreground">
                  Use o formulário acima para enviar arquivos
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(file)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFilesTab;