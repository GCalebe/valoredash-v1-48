import React from 'react';
import { cn } from '@/lib/utils';
import { User, Shield, Crown } from 'lucide-react';

export interface SimpleRole {
  id: string;
  name: string;
  color: string;
}

interface RoleTabsProps {
  roles: SimpleRole[];
  selectedRoleId: string;
  onSelect: (roleId: string) => void;
}

const RoleTabs: React.FC<RoleTabsProps> = ({ roles, selectedRoleId, onSelect }) => {
  const renderIcon = (roleId: string) => {
    if (roleId === 'corretor') return <User className="h-3.5 w-3.5" />;
    if (roleId === 'gestor') return <Shield className="h-3.5 w-3.5" />;
    if (roleId === 'administrador') return <Crown className="h-3.5 w-3.5" />;
    return <User className="h-3.5 w-3.5" />;
  };

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      {roles.map((role) => (
        <button
          key={role.id}
          className={cn(
            'py-2 px-4 text-sm font-medium border-b-2 focus:outline-none',
            selectedRoleId === role.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
          )}
          onClick={() => onSelect(role.id)}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: role.color }}
            >
              {renderIcon(role.id)}
            </div>
            <span>{role.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RoleTabs;


