import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShipWheel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useThemeSettings();

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
            onClick={() => navigate("/dashboard")}
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
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-0 px-3 py-1"
          >
            {user?.user_metadata?.name || user?.email}
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
