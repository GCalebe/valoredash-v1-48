import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  ArrowLeft 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/client";
import { useAuth } from "@/context/AuthContext";

interface ClientImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onImportComplete: () => void;
}

interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string; data?: any }>;
  total: number;
}

const ClientImportModal = ({
  isOpen,
  onClose,
  onBack,
  onImportComplete,
}: ClientImportModalProps) => {
  const [step, setStep] = useState<'instructions' | 'upload' | 'processing' | 'results'>('instructions');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleDownloadTemplate = () => {
    // Create CSV content with headers and example data
    const csvContent = `name,email,phone,client_name,address,cpf_cnpj,client_type,client_size,client_sector,client_objective,notes,payment_method,consultation_stage,tags
João Silva,joao@exemplo.com,11999999999,Empresa XYZ Ltda,Rua das Flores 123 - São Paulo/SP,12.345.678/0001-90,Pessoa Jurídica,Médio Porte,Tecnologia,Aumentar vendas online,Cliente interessado em soluções digitais,Cartão de Crédito,Nova consulta,"tecnologia,vendas"
Maria Santos,maria@exemplo.com,11888888888,Maria Santos MEI,Av. Paulista 456 - São Paulo/SP,123.456.789-00,Pessoa Física,Pequeno Porte,Consultoria,Otimizar processos,Busca consultoria em gestão,PIX,Qualificado,"consultoria,gestão"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo-importacao-clientes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template baixado",
      description: "O arquivo modelo foi baixado com sucesso!",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo CSV.",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            let value = values[index];
            // Handle tags field (convert comma-separated to array)
            if (header === 'tags' && value) {
              row[header] = value.split(';').map(tag => tag.trim()).filter(tag => tag);
            } else {
              row[header] = value || null;
            }
          }
        });
        data.push(row);
      }
    }
    return data;
  };

  const validateContact = (contact: any, rowIndex: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!contact.name || contact.name.trim() === '') {
      errors.push('Nome é obrigatório');
    }
    
    if (contact.email && !contact.email.includes('@')) {
      errors.push('Email inválido');
    }
    
    if (contact.phone && contact.phone.length < 10) {
      errors.push('Telefone deve ter pelo menos 10 dígitos');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setStep('processing');
    setProgress(0);

    try {
      const text = await file.text();
      const contacts = parseCSV(text);
      
      const results: ImportResult = {
        success: 0,
        errors: [],
        total: contacts.length
      };

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const { isValid, errors } = validateContact(contact, i + 2); // +2 because row 1 is headers

        if (!isValid) {
          results.errors.push({
            row: i + 2,
            message: errors.join(', '),
            data: contact
          });
          setProgress(((i + 1) / contacts.length) * 100);
          continue;
        }

        try {
          // Transform the data to match our contacts table structure
          const contactData = {
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            client_name: contact.client_name || null,
            address: contact.address || null,
            cpf_cnpj: contact.cpf_cnpj || null,
            client_type: contact.client_type || null,
            client_size: contact.client_size || null,
            client_sector: contact.client_sector || null,
            client_objective: contact.client_objective || null,
            notes: contact.notes || null,
            payment_method: contact.payment_method || null,
            consultation_stage: contact.consultation_stage || 'Nova consulta',
            tags: contact.tags || [],
            status: 'Active' as const,
            user_id: user.id,
            session_id: `import_${Date.now()}_${i}`,
            kanban_stage_id: "c289c752-cbc5-4861-b858-510e6fe93875", // Default to first stage
          };

          const { error } = await supabase
            .from('contacts')
            .insert(contactData);

          if (error) {
            results.errors.push({
              row: i + 2,
              message: error.message,
              data: contact
            });
          } else {
            results.success++;
          }
        } catch (error) {
          results.errors.push({
            row: i + 2,
            message: error instanceof Error ? error.message : 'Erro desconhecido',
            data: contact
          });
        }

        setProgress(((i + 1) / contacts.length) * 100);
      }

      setImportResult(results);
      setStep('results');

      if (results.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} cliente(s) importado(s) com sucesso!`,
        });
      }

    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Erro ao processar o arquivo CSV.",
      });
      setStep('upload');
    }
  };

  const renderInstructions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importar clientes via planilha</h3>
        <p className="text-muted-foreground">
          Siga os passos abaixo para importar seus clientes
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Baixar modelo da planilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Baixe nosso modelo CSV com os campos corretos e exemplos de preenchimento.
            </p>
            <Button onClick={handleDownloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Fazer upload da planilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Salve como CSV e faça o upload aqui. Validaremos e importaremos os dados automaticamente.
            </p>
            <Button onClick={() => setStep('upload')} className="w-full" variant="outline">
              Continuar para Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selecionar arquivo CSV</h3>
        <p className="text-muted-foreground">
          Escolha o arquivo CSV com os dados dos clientes
        </p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Escolher Arquivo CSV
            </Button>
            
            {file && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {file && (
        <div className="flex gap-2">
          <Button onClick={handleImport} className="flex-1">
            Importar Clientes
          </Button>
          <Button variant="outline" onClick={() => setFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="space-y-6 text-center">
      <div>
        <Upload className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">Processando importação...</h3>
        <p className="text-muted-foreground">
          Aguarde enquanto importamos seus clientes
        </p>
      </div>
      
      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</p>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        {importResult?.errors.length === 0 ? (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ) : (
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">Importação concluída</h3>
      </div>

      {importResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{importResult.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </div>

          {importResult.errors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erros encontrados:</strong>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-xs">
                      Linha {error.row}: {error.message}
                    </div>
                  ))}
                  {importResult.errors.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      ... e mais {importResult.errors.length - 5} erros
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={() => {
              onImportComplete();
              onClose();
            }} className="flex-1">
              Concluir
            </Button>
            <Button variant="outline" onClick={() => {
              setStep('upload');
              setFile(null);
              setImportResult(null);
            }}>
              Importar Novamente
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== 'instructions' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={step === 'upload' ? () => setStep('instructions') : onBack}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Upload className="h-5 w-5 text-primary" />
            Importar Clientes
          </DialogTitle>
        </DialogHeader>

        {step === 'instructions' && renderInstructions()}
        {step === 'upload' && renderUpload()}
        {step === 'processing' && renderProcessing()}
        {step === 'results' && renderResults()}

        {step === 'instructions' && (
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientImportModal;