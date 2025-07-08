import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface ClientsRefreshButtonProps {
  handleRefresh: () => void;
  refreshing: boolean;
}

const ClientsRefreshButton: React.FC<ClientsRefreshButtonProps> = ({
  handleRefresh,
  refreshing,
}) => (
  <Button
    variant="outline"
    onClick={handleRefresh}
    disabled={refreshing}
    className="border-white text-white bg-transparent hover:bg-white/20 min-w-[110px] transition-all"
    style={{
      height: 40,
      borderRadius: 8,
      borderWidth: 1.4,
    }}
  >
    <RefreshCcw
      className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
    />
    <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
  </Button>
);

export default ClientsRefreshButton;
