import React from 'react';
import { Badge } from '@/components/ui/badge';
import PermissionItem from './PermissionItem';

interface PermissionsSectionProps {
  title: string;
  icon: React.ReactNode;
  permissions: { id: string; name: string; description: string }[];
  selectedPermissions: string[];
  onToggle: (id: string) => void;
}

const PermissionsSection: React.FC<PermissionsSectionProps> = ({ title, icon, permissions, selectedPermissions, onToggle }) => {
  const enabledCount = selectedPermissions.filter((p) => permissions.some((perm) => perm.id === p)).length;
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Badge variant="outline" className="text-xs">
          {enabledCount}/{permissions.length}
        </Badge>
      </div>
      <div className="space-y-4">
        {permissions.map((permission) => (
          <PermissionItem
            key={permission.id}
            id={permission.id}
            name={permission.name}
            description={permission.description}
            icon={icon}
            enabled={selectedPermissions.includes(permission.id)}
            onToggle={() => onToggle(permission.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PermissionsSection;


