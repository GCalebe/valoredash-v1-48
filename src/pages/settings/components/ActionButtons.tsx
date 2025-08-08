import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface ActionButtonsProps {
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ActionButtons({ loading, onSave, onCancel }: ActionButtonsProps) {
  return (
    <div className="flex gap-4">
      <Button className="flex-1" onClick={onSave} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {loading ? "Salvando..." : "Salvar Configurações"}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
    </div>
  );
}

export default ActionButtons;


