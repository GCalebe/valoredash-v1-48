import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
//
import { Upload, ArrowLeft } from "lucide-react";
import ImportInstructions from "./import/ImportInstructions";
import UploadStep from "./import/UploadStep";
import ProcessingStep from "./import/ProcessingStep";
import ResultsStep from "./import/ResultsStep";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
//
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
  //
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

  //

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
      const message = error instanceof Error ? error.message : 'Erro ao processar o arquivo CSV.';
      toast({ title: 'Erro na importação', description: message });
      setStep('upload');
    }
  };

  const renderInstructions = () => (
    <ImportInstructions onDownloadTemplate={handleDownloadTemplate} onNext={() => setStep('upload')} />
  );

  const renderUpload = () => (
    <UploadStep file={file} setFile={setFile} onImport={handleImport} />
  );

  const renderProcessing = () => <ProcessingStep progress={progress} />;

  const renderResults = () => (importResult ? <ResultsStep result={importResult} /> : null);

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