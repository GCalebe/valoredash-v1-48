import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import {
  BarChart,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  MessageSquare,
  Settings,
  ShipWheel,
  Users,
  Link,
  Bot,
  CreditCard,
  Shield,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useThemeSettings();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: "PRINCIPAL",
      items: [
        {
          name: "Dashboard",
          icon: Home,
          path: "/dashboard",
        },
        {
          name: "Agenda",
          icon: Calendar,
          path: "/schedule",
        },
        {
          name: "Clientes",
          icon: Users,
          path: "/clients",
        },
        // Botão de Contratos desativado conforme solicitado
        // {
        //   name: "Contratos",
        //   icon: FileText,
        //   path: "/contracts",
        // },
        {
          name: "Conexões",
          icon: Link,
          path: "/evolution",
        },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        {
          name: "Relatórios",
          icon: BarChart,
          path: "/metrics",
        },
        // Botão de Portais desativado conforme solicitado
        // {
        //   name: "Portais",
        //   icon: Link,
        //   path: "/analytics-portals",
        // },
      ],
    },
    {
      title: "INTELIGÊNCIA ARTIFICIAL",
      items: [
        // Botão de Loja de IAs desativado conforme solicitado
        // {
        //   name: "Loja de IAs",
        //   icon: Bot,
        //   path: "/ai-store",
        // },
        {
          name: "Conhecimento",
          icon: FileText,
          path: "/knowledge",
        },
        {
          name: "Conversas",
          icon: MessageSquare,
          path: "/chats",
        },
      ],
    },
    {
      title: "OUTROS",
      items: [
        {
          name: "Assinatura",
          icon: CreditCard,
          path: "/subscription",
        },
        {
          name: "Configurações",
          icon: Settings,
          path: "/theme-settings",
        },
        ...(isAdmin
          ? [
              {
                name: "Administração",
                icon: Shield,
                path: "/admin",
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-[220px] bg-[#0f172a] dark:bg-gray-900 text-white overflow-y-auto",
        className
      )}
    >
      <div className="p-4 flex items-center gap-2 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600">
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              className="h-5 w-5 object-contain"
            />
          ) : (
            <ShipWheel className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm">{settings.brandName}</span>
          <span className="text-xs text-gray-400">Comercial 247</span>
        </div>
      </div>

      <div className="flex-1 py-4">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-4 mb-2">
              <span className="text-xs font-medium text-gray-400">
                {section.title}
              </span>
            </div>
            <ul>
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center w-full px-4 py-2 text-sm transition-colors",
                      isActive(item.path)
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center w-full rounded-md bg-gray-800 p-2 text-sm hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 mr-2">
            <span className="font-bold text-white">A</span>
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="font-medium truncate w-full">Admin</span>
            <span className="text-xs text-gray-400 truncate w-full">
              admin@comercial247.com
            </span>
          </div>
          <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;