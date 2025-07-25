import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface TimelineEvent {
  id: number;
  date: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface GroupedTimelineDay {
  date: string;
  formattedDate: string;
  events: TimelineEvent[];
}

export function TimelineItem({ day }: { day: GroupedTimelineDay }) {
  return (
    <div className="mb-8">
      <div className="sticky top-0 bg-background z-10 py-2">
        <h3 className="text-lg font-medium flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          {day.formattedDate}
        </h3>
      </div>
      <div className="ml-6 border-l pl-6 pt-2">
        {day.events.map((event) => (
          <div key={`${event.id}-${event.date}`} className="mb-4 relative">
            <div className="absolute -left-9 mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Clock className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {format(new Date(event.date), 'HH:mm', { locale: ptBR })}
              </span>
              <p className="text-sm mt-1">{event.description}</p>
              {event.details && (
                <div className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


