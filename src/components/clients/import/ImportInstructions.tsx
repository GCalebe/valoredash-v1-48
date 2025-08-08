// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface ImportInstructionsProps {
  onDownloadTemplate: () => void;
  onNext: () => void;
}

const ImportInstructions: React.FC<ImportInstructionsProps> = ({ onDownloadTemplate, onNext }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importar clientes via planilha</h3>
        <p className="text-muted-foreground">Siga os passos abaixo para importar seus clientes</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Baixar modelo da planilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Baixe nosso modelo CSV com os campos corretos e exemplos de preenchimento.</p>
            <Button onClick={onDownloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Preencher a planilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Abra o arquivo no Excel, Google Sheets ou similar. Preencha os dados dos seus clientes seguindo o exemplo.
              <br />
              <strong>Campos obrigatórios:</strong> Nome
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Fazer upload da planilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Salve como CSV e faça o upload aqui. Validaremos e importaremos os dados automaticamente.</p>
            <Button onClick={onNext} className="w-full" variant="outline">Continuar para Upload</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportInstructions;


