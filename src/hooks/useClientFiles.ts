// @ts-nocheck
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileMetadata } from '@/types/file';

interface UseClientFilesProps {
  clientId?: string;
  onFileUpdate?: (files: FileMetadata[]) => void;
}

export const useClientFiles = ({ clientId, onFileUpdate }: UseClientFilesProps) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, max: 100 * 1024 * 1024 });
  const { toast } = useToast();
  const { user } = useAuth();

  const maxFileSize = 10 * 1024 * 1024; // 10MB per file

  useEffect(() => {
    if (clientId) {
      loadClientFiles();
    }
    loadStorageUsage();
  }, [clientId]); // Remove function dependencies to prevent unnecessary re-renders

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

      const filesWithUrls = await Promise.all(
        filesMetadata.map(async (file) => {
          const { data } = await supabase.storage
            .from('client-files')
            .createSignedUrl(file.path, 3600);

          return {
            ...file,
            url: data?.signedUrl,
          };
        }),
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];

    if (file.size > maxFileSize) {
      toast({
        title: 'Arquivo muito grande',
        description: `O arquivo deve ter no máximo ${formatFileSize(maxFileSize)}`,
        variant: 'destructive',
      });
      return;
    }

    if (storageUsage.used + file.size > storageUsage.max) {
      toast({
        title: 'Limite de armazenamento atingido',
        description: 'Você não tem espaço suficiente para este arquivo',
        variant: 'destructive',
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
            contentType: file.type,
          },
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
        path: fileName,
      };

      const updatedFiles = [...files, fileMetadata];
      setFiles(updatedFiles);

      const { error: updateError } = await supabase
        .from('contacts')
        .update({ files_metadata: updatedFiles as FileMetadata[] })
        .eq('id', clientId);

      if (updateError) {
        throw updateError;
      }

      onFileUpdate?.(updatedFiles);
      loadStorageUsage();

      toast({
        title: 'Arquivo enviado',
        description: 'O arquivo foi enviado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast({
        title: 'Erro no upload',
        description: 'Falha ao enviar o arquivo',
        variant: 'destructive',
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

      const updatedFiles = files.filter((f) => f.id !== fileToDelete.id);
      setFiles(updatedFiles);

      const { error: updateError } = await supabase
        .from('contacts')
        .update({ files_metadata: updatedFiles as FileMetadata[] })
        .eq('id', clientId);

      if (updateError) {
        throw updateError;
      }

      onFileUpdate?.(updatedFiles);
      loadStorageUsage();

      toast({
        title: 'Arquivo removido',
        description: 'O arquivo foi removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover o arquivo',
        variant: 'destructive',
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

  const storagePercentage = (storageUsage.used / storageUsage.max) * 100;

  return {
    files,
    isUploading,
    storageUsage,
    storagePercentage,
    maxFileSize,
    handleFileSelect,
    deleteFile,
    downloadFile,
    formatFileSize,
    reloadFiles: loadClientFiles,
  };
};
