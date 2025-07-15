import React from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { Permission } from "@/hooks/usePermissionsManager";

interface PermissionToggleProps {
  permission: Permission;
  icon: React.ReactNode;
  isEnabled: boolean;
  onToggle: () => void;
}

const PermissionToggle: React.FC<PermissionToggleProps> = ({ permission, icon, isEnabled, onToggle }) => {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
    >
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">{icon}</div>
        <div>
          <h4 className="font-medium">{permission.name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{permission.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isEnabled ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Ativo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
            <X className="h-3 w-3" />
            Inativo
          </Badge>
        )}
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );
};

export default PermissionToggle;
