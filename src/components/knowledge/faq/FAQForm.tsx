import React from "react";
import Select from 'react-select';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FAQFormData } from "@/hooks/useFAQManagement";
import { useAgendasQuery } from "@/hooks/useAgendasQuery";

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
  const { data: agendas, isLoading: isLoadingAgendas } = useAgendasQuery();

  const agendaOptions = agendas?.map(agenda => ({
    value: agenda.id,
    label: agenda.name,
  })) || [];

  const selectedAgendas = agendaOptions.filter(option => 
    faq.associated_agendas?.includes(option.value)
  );

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
          <Label>Agendas Associadas</Label>
          <Select
            isMulti
            options={agendaOptions}
            value={selectedAgendas}
            onChange={(selectedOptions) => {
              const selectedIds = selectedOptions.map(option => option.value);
              setFaq({ ...faq, associated_agendas: selectedIds });
            }}
            isLoading={isLoadingAgendas}
            placeholder="Selecione uma ou mais agendas..."
            noOptionsMessage={() => "Nenhuma agenda encontrada."}
            styles={{
                control: (base) => ({
                  ...base,
                  background: 'hsl(var(--input))',
                  borderColor: 'hsl(var(--input))',
                }),
                menu: (base) => ({
                  ...base,
                  background: 'hsl(var(--background))',
                  zIndex: 50,
                }),
                option: (base, { isFocused }) => ({
                    ...base,
                    background: isFocused ? 'hsl(var(--accent))' : 'hsl(var(--background))',
                }),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'hsl(var(--primary))',
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: 'hsl(var(--primary-foreground))',
                }),
            }}
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
