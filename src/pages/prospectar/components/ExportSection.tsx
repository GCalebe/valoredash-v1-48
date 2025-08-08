import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Send, Info, Download } from 'lucide-react';

interface ExportSectionProps {
  selectedCount: number;
  totalCount: number;
  onExportSelected: () => void;
  onExportAll: () => void;
  onExportDisparador: () => void;
}

const ExportSection: React.FC<ExportSectionProps> = ({ selectedCount, totalCount, onExportSelected, onExportAll, onExportDisparador }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          <FileSpreadsheet className="h-8 w-8 mx-auto text-green-600 mb-2" />
          Exportar Dados
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">Gere um arquivo Excel com os prospects selecionados</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={onExportSelected} disabled={selectedCount === 0} className="w-full bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar {selectedCount} Selecionados
        </Button>
        <Button onClick={onExportAll} disabled={totalCount === 0} variant="outline" className="w-full">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Todos ({totalCount})
        </Button>
        <Button onClick={onExportDisparador} disabled={selectedCount === 0} className="w-full bg-yellow-600 hover:bg-yellow-700">
          <Send className="mr-2 h-4 w-4" />
          Disparador PRO ({selectedCount})
        </Button>
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
          <div className="flex items-start gap-1 mb-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Dados inclusos:</strong> Nome, Endereço, Telefone, E-mail, Rating, Reviews, Website, Status WhatsApp
            </div>
          </div>
          <div className="flex items-start gap-1 text-yellow-600">
            <Send className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Disparador PRO:</strong> Formato simplificado (Nome, Telefone, E-mail)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportSection;


