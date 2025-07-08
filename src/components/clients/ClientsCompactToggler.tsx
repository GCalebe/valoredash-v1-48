import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Maximize2, Minimize2 } from "lucide-react";

interface ClientsCompactTogglerProps {
  isCompactView: boolean;
  setIsCompactView: (value: boolean) => void;
  visible?: boolean;
}

const ClientsCompactToggler: React.FC<ClientsCompactTogglerProps> = ({
  isCompactView,
  setIsCompactView,
  visible,
}) => {
  if (!visible) return null;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCompactView(!isCompactView)}
            className="h-9 w-9 text-white border-white hover:bg-white/20"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {isCompactView ? (
              <Maximize2 className="h-4 w-4 text-white" />
            ) : (
              <Minimize2 className="h-4 w-4 text-white" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCompactView ? "Visão Padrão" : "Visão Compacta"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ClientsCompactToggler;
