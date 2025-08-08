import React from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";

export interface PermissionItemProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ id, name, description, icon, enabled, onToggle }) => {
  return (
    <div
      key={id}
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
    >
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">{icon}</div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {enabled ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
            <Check className="h-3 w-3" /> Ativo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-500 flex items-center gap-1">
            <X className="h-3 w-3" /> Inativo
          </Badge>
        )}
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );
};

export default PermissionItem;


