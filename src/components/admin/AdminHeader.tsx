import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, ShipWheel, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  user: any;
  settings: any;
  onSignOut: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  settings,
  onSignOut,
}) => {
  const navigate = useNavigate();

  return (
    <header
      className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-4 sm:px-6 py-0">
        <div className="flex items-center gap-2 sm:gap-4">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <h1 className="text-lg sm:text-2xl font-bold">
              {settings.brandName}
            </h1>
            <span className="text-sm sm:text-lg">Administração</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="bg-white/10 text-white border-0 px-2 sm:px-3 py-1 hidden sm:inline"
          >
            {user?.user_metadata?.name || user?.email}
          </Badge>
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={onSignOut}
            className="border-white text-white bg-transparent hover:bg-white/20"
            style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
