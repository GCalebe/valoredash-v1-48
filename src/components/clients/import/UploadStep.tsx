// @ts-nocheck
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface UploadStepProps {
  file: File | null;
  setFile: (f: File | null) => void;
  onImport: () => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ file, setFile, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selecionar arquivo CSV</h3>
        <p className="text-muted-foreground">Escolha o arquivo CSV com os dados dos clientes</p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="text-center">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".csv" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Escolher Arquivo CSV
            </Button>
            {file && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {file && (
        <div className="flex gap-2">
          <Button onClick={onImport} className="flex-1">Importar Clientes</Button>
          <Button variant="outline" onClick={() => setFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadStep;


