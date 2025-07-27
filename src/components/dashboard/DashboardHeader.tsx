import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import { LogOut, ShipWheel, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationIcon from "@/components/dashboard/NotificationIcon";

const DashboardHeader = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();

  return (
    <header
      className="text-white shadow-md transition-colors duration-300 rounded-b-xl flex-shrink-0"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <div className="flex flex-row items-center justify-between h-16 w-full px-6">
        <div className="flex items-center gap-4">
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
          <h1 className="text-xl font-bold">{settings.brandName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="border-white text-white bg-transparent hover:bg-white/20 h-8 px-2"
              style={{ borderRadius: 8, borderWidth: 1.4 }}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          )}
          <NotificationIcon />
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
            className="border-white text-white bg-transparent hover:bg-white/20 h-8 px-2"
            style={{ borderRadius: 8, borderWidth: 1.4 }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;