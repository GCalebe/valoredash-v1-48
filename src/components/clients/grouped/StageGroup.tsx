import React from "react";
import { ChevronDown } from "lucide-react";
import { GroupedContacts } from "@/hooks/useGroupedContactsByStageTag";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/animate-ui/base/accordion";
import TagGroup from "./TagGroup";
import { Badge } from "@/components/ui/badge";

interface StageGroupProps {
  stage: GroupedContacts;
  visibleColumns: string[];
  onConfigureColumns: () => void;
  onViewDetails: (contact: any) => void;
  onSendMessage: (contactId: string) => void;
  onEditClient: (contact: any) => void;
}

const StageGroup: React.FC<StageGroupProps> = ({ stage, visibleColumns, onConfigureColumns, onViewDetails, onSendMessage, onEditClient }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Accordion type="multiple" defaultValue={[stage.stageId]}>
        <AccordionItem value={stage.stageId} className="border-b-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3 w-full">
              <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color || 'var(--muted-foreground)' }} />
              <div className="flex-1 flex items-center justify-between">
                <div className="font-medium">{stage.stageTitle}</div>
                <Badge variant="secondary" className="ml-2">{stage.totalCount}</Badge>
              </div>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </div>
          </AccordionTrigger>
          <AccordionPanel className="px-0 pb-3">
            <div className="space-y-2">
              {stage.tags.map((tagGroup) => (
                <TagGroup
                  key={`${stage.stageId}-${tagGroup.tag}`}
                  stageId={stage.stageId}
                  tag={tagGroup.tag}
                  contacts={tagGroup.contacts}
                  visibleColumns={visibleColumns}
                  onConfigureColumns={onConfigureColumns}
                  onViewDetails={onViewDetails}
                  onSendMessage={onSendMessage}
                  onEditClient={onEditClient}
                />
              ))}
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default StageGroup;
