import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, Calendar, Users, FileText, Link as LinkIcon, MessageSquare, Bot, Settings, Shield } from "lucide-react";
import usePermissionsManager from "@/hooks/usePermissionsManager";
import RoleCard from "./RoleCard";
import PermissionToggle from "./PermissionToggle";
import { cn } from "@/lib/utils";

const PermissionsManager: React.FC = () => {
  const {
    permissions,
    roles,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    togglePermission,
    menuPermissions,
    featurePermissions,
    adminPermissions,
    calculatePermissionPercentage,
  } = usePermissionsManager();

  const getPermissionIcon = (permissionId: string) => {
    if (permissionId.startsWith("menu_")) {
      if (permissionId.includes("agenda")) return <Calendar className="h-4 w-4" />;
      if (permissionId.includes("clientes")) return <Users className="h-4 w-4" />;
      if (permissionId.includes("contratos")) return <FileText className="h-4 w-4" />;
      if (permissionId.includes("conexoes")) return <LinkIcon className="h-4 w-4" />;
      if (permissionId.includes("conversas")) return <MessageSquare className="h-4 w-4" />;
      if (permissionId.includes("ias")) return <Bot className="h-4 w-4" />;
      return <Menu className="h-4 w-4" />;
    }

    if (permissionId.startsWith("feature_")) {
      return <Settings className="h-4 w-4" />;
    }

    if (permissionId.startsWith("admin_")) {
      return <Shield className="h-4 w-4" />;
    }

    return <Settings className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sistema de Permissões</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure o acesso às funcionalidades por tipo de usuário</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            totalPermissions={permissions.length}
            percentage={calculatePermissionPercentage(role)}
            active={selectedRoleId === role.id}
            onSelect={() => setSelectedRoleId(role.id)}
          />
        ))}
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {roles.map(role => (
          <button
            key={role.id}
            className={cn(
              "py-2 px-4 text-sm font-medium border-b-2 focus:outline-none",
              selectedRoleId === role.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
            onClick={() => setSelectedRoleId(role.id)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: role.color }}
              >
                {role.icon}
              </div>
              <span>{role.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: selectedRole.color }}
            >
              {selectedRole.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold">Permissões - {selectedRole.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">Controle o acesso às funcionalidades do sistema</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Menu className="h-5 w-5 text-gray-500" />
              Menus de Navegação
            </h3>
            <Badge variant="outline" className="text-xs">
              {selectedRole.permissions.filter(p => p.startsWith("menu_")).length}/{menuPermissions.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {menuPermissions.map(permission => (
              <PermissionToggle
                key={permission.id}
                permission={permission}
                icon={getPermissionIcon(permission.id)}
                isEnabled={selectedRole.permissions.includes(permission.id)}
                onToggle={() => togglePermission(permission.id)}
              />
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              Funcionalidades
            </h3>
            <Badge variant="outline" className="text-xs">
              {selectedRole.permissions.filter(p => p.startsWith("feature_")).length}/{featurePermissions.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {featurePermissions.map(permission => (
              <PermissionToggle
                key={permission.id}
                permission={permission}
                icon={getPermissionIcon(permission.id)}
                isEnabled={selectedRole.permissions.includes(permission.id)}
                onToggle={() => togglePermission(permission.id)}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500" />
              Administração
            </h3>
            <Badge variant="outline" className="text-xs">
              {selectedRole.permissions.filter(p => p.startsWith("admin_")).length}/{adminPermissions.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {adminPermissions.map(permission => (
              <PermissionToggle
                key={permission.id}
                permission={permission}
                icon={getPermissionIcon(permission.id)}
                isEnabled={selectedRole.permissions.includes(permission.id)}
                onToggle={() => togglePermission(permission.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Salvar Alterações</Button>
      </div>
    </div>
  );
};

export default PermissionsManager;
