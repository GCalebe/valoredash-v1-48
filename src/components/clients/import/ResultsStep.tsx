// @ts-nocheck
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string; data?: any }>;
  total: number;
}

const ResultsStep: React.FC<{ result: ImportResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        {result?.errors.length === 0 ? (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ) : (
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">Importação concluída</h3>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{result.success}</p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{result.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </div>

          {result.errors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erros encontrados:</strong>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-sm">
                      Linha {error.row}: {error.message}
                    </div>
                  ))}
                  {result.errors.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      + {result.errors.length - 5} outros erros
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsStep;


