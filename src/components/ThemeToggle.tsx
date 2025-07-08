import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const navigate = useNavigate();

  const handleThemeSettings = () => {
    navigate("/theme-settings");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeSettings}
      className="text-white hover:bg-white/20 focus-visible:ring-white"
    >
      <Settings className="h-4 w-4" />
      <span className="sr-only">Configurações de tema</span>
    </Button>
  );
}
