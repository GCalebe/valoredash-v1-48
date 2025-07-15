import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Role } from "@/hooks/usePermissionsManager";

interface RoleCardProps {
  role: Role;
  totalPermissions: number;
  percentage: number;
  active: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, totalPermissions, percentage, active, onSelect }) => {
  const activePermissions = role.permissions.length;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        active && "border-2",
        active && role.id === "corretor" && "border-green-500",
        active && role.id === "gestor" && "border-blue-500",
        active && role.id === "administrador" && "border-red-500"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: role.color }}
            >
              {role.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{role.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activePermissions}/{totalPermissions} ativas
              </p>
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold" style={{ color: role.color }}>
              {percentage}%
            </span>
          </div>
        </div>
        <Progress
          value={percentage}
          className="h-2"
          style={{ "--progress-background": role.color } as React.CSSProperties}
        />
      </CardContent>
    </Card>
  );
};

export default RoleCard;
