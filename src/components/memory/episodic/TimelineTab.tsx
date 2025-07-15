import { Skeleton } from '@/components/ui/skeleton';
import { TimelineItem, GroupedTimelineDay } from './TimelineItem';

interface Props {
  loading: boolean;
  groupedTimeline: GroupedTimelineDay[];
}

export function TimelineTab({ loading, groupedTimeline }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (groupedTimeline.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhum evento na linha do tempo para exibir.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {groupedTimeline.map((day) => (
        <TimelineItem key={day.date} day={day} />
      ))}
    </div>
  );
}


