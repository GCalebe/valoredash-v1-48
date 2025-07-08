import React from "react";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface ClientsViewTogglerProps {
  viewMode: "table" | "kanban";
  setViewMode: (v: "table" | "kanban") => void;
}

const ClientsViewToggler: React.FC<ClientsViewTogglerProps> = ({
  viewMode,
  setViewMode,
}) => (
  <div className="flex items-center border border-white rounded-lg bg-white/10">
    <Button
      variant={viewMode === "table" ? "default" : "ghost"}
      size="sm"
      onClick={() => setViewMode("table")}
      className={`rounded-r-none ${
        viewMode === "table"
          ? "bg-white text-blue-700"
          : "text-white hover:bg-white/20 border-0"
      }`}
      style={viewMode === "table" ? {} : { borderRight: "1px solid #ffffff55" }}
    >
      <List className="h-4 w-4" />
    </Button>
    <Button
      variant={viewMode === "kanban" ? "default" : "ghost"}
      size="sm"
      onClick={() => setViewMode("kanban")}
      className={`rounded-l-none ${
        viewMode === "kanban"
          ? "bg-white text-blue-700"
          : "text-white hover:bg-white/20"
      }`}
    >
      <Grid className="h-4 w-4" />
    </Button>
  </div>
);

export default ClientsViewToggler;
