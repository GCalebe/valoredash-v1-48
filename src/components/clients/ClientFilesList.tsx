import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { FileMetadata } from "@/types/file";

interface ClientFilesListProps {
  files: FileMetadata[];
  readOnly?: boolean;
  formatFileSize: (bytes: number) => string;
  onDownload: (file: FileMetadata) => void;
  onDelete?: (file: FileMetadata) => void;
}

const ClientFilesList: React.FC<ClientFilesListProps> = ({
  files,
  readOnly = false,
  formatFileSize,
  onDownload,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Arquivos Enviados</CardTitle>
        <CardDescription>Lista de todos os arquivos do cliente</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum arquivo enviado ainda</p>
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
                  <Button variant="ghost" size="sm" onClick={() => onDownload(file)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {!readOnly && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(file)}
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
  );
};

export default ClientFilesList;
