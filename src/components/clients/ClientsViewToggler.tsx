import React from "react";
import { Button } from "@/components/ui/button";
import { Grid, List, TrendingUp, Tag } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClientsViewTogglerProps {
  viewMode: "table" | "kanban" | "tree-sales" | "tree-marketing";
  setViewMode: (v: "table" | "kanban" | "tree-sales" | "tree-marketing") => void;
}

const ClientsViewToggler: React.FC<ClientsViewTogglerProps> = ({
  viewMode,
  setViewMode,
}) => {
  const views = [
    { id: "table", icon: List, label: "Lista" },
    { id: "kanban", icon: Grid, label: "Kanban" },
    { id: "tree-sales", icon: TrendingUp, label: "Funil" },
    { id: "tree-marketing", icon: Tag, label: "Marketing" }
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center border border-white rounded-lg bg-white/10">
        {views.map((view, index) => {
          const Icon = view.icon;
          const isActive = viewMode === view.id;
          const isFirst = index === 0;
          const isLast = index === views.length - 1;
          
          return (
            <Tooltip key={view.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(view.id as "table" | "kanban" | "tree-sales" | "tree-marketing")}
                  className={`${
                    isFirst ? "rounded-r-none" : isLast ? "rounded-l-none" : "rounded-none"
                  } ${
                    isActive
                      ? "bg-white text-blue-700"
                      : "text-white hover:bg-white/20 border-0"
                  }`}
                  style={!isActive && !isLast ? { borderRight: "1px solid #ffffff55" } : {}}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{view.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ClientsViewToggler;
