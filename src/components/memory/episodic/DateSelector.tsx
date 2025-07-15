import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  label: string;
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export function DateSelector({ label, date, onSelect }: Props) {
  return (
    <div className="flex-1">
      <p className="text-sm mb-2">{label}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, 'dd/MM/yyyy', { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar selected={date} onSelect={onSelect} className="pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );
}


