import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FAQFormData } from "@/hooks/useFAQManagement";

interface FAQFormProps {
  faq: FAQFormData;
  setFaq: React.Dispatch<React.SetStateAction<FAQFormData>>;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  submitLabel: string;
}

const FAQForm: React.FC<FAQFormProps> = ({
  faq,
  setFaq,
  onCancel,
  onSubmit,
  isLoading,
  submitLabel,
}) => {
  return (
    <>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="question">Pergunta *</Label>
          <Textarea
            id="question"
            placeholder="Digite a pergunta..."
            value={faq.question}
            onChange={(e) => setFaq({ ...faq, question: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="answer">Resposta *</Label>
          <Textarea
            id="answer"
            placeholder="Digite a resposta..."
            value={faq.answer}
            onChange={(e) => setFaq({ ...faq, answer: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            placeholder="ex: Agendamento, Valores..."
            value={faq.category}
            onChange={(e) => setFaq({ ...faq, category: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            placeholder="ex: agendamento, consulta, preço"
            value={faq.tags}
            onChange={(e) => setFaq({ ...faq, tags: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Salvando..." : submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
};

export default FAQForm;
