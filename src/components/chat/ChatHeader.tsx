import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShipWheel, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ChatHeaderProps {
  signOut: () => void;
}

const ChatHeader = ({ signOut }: ChatHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useThemeSettings();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header
      className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToDashboard}
            className="text-white hover:bg-white/20 focus-visible:ring-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <ShipWheel
              className="h-8 w-8"
              style={{ color: settings.secondaryColor }}
            />
          )}
          <h1 className="text-2xl font-bold">{settings.brandName}</h1>
          <span className="text-lg ml-2">- Conversas</span>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-0 px-3 py-1"
          >
            {user?.user_metadata?.name || user?.email}
          </Badge>
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={signOut}
            className="border-white text-white bg-transparent hover:bg-white/20"
            style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
