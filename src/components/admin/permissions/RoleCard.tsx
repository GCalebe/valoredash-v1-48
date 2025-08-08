import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface RoleCardProps {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  activePermissions: number;
  totalPermissions: number;
  isSelected: boolean;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  id,
  name,
  color,
  icon,
  activePermissions,
  totalPermissions,
  isSelected,
  onSelect,
}) => {
  const percentage = Math.round((activePermissions / Math.max(totalPermissions, 1)) * 100);

  return (
    <Card
      key={id}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "border-2",
        isSelected && id === "corretor" && "border-green-500",
        isSelected && id === "gestor" && "border-blue-500",
        isSelected && id === "administrador" && "border-red-500",
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activePermissions}/{totalPermissions} ativas
              </p>
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold" style={{ color }}>
              {percentage}%
            </span>
          </div>
        </div>
        <Progress value={percentage} className="h-2" style={{ ["--progress-background" as any]: color }} />
      </CardContent>
    </Card>
  );
};

export default RoleCard;


