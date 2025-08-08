import React, { useState } from "react";
//
import { Button } from "@/components/ui/button";
//
//
import { User, Shield, Crown, Settings, Menu } from "lucide-react";
import RoleTabs from "./permissions/RoleTabs";
import RoleCard from "./permissions/RoleCard";
import PermissionsSection from "./permissions/PermissionsSection";

// Types for our permissions system
interface Role {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const PermissionsManager: React.FC = () => {
  // Define available permissions
  const [permissions] = useState<Permission[]>([
    // Navigation Menu Permissions
    {
      id: "menu_dashboard",
      name: "Dashboard",
      description: "Acesso ao painel principal",
      category: "menus",
    },
    {
      id: "menu_agenda",
      name: "Agenda",
      description: "Agenda de compromissos",
      category: "menus",
    },
    {
      id: "menu_clientes",
      name: "Clientes",
      description: "Gerenciamento de clientes",
      category: "menus",
    },
    {
      id: "menu_contratos",
      name: "Contratos",
      description: "Gerenciar contratos",
      category: "menus",
    },
    {
      id: "menu_conexoes",
      name: "Conexões WhatsApp",
      description: "WhatsApp",
      category: "menus",
    },
    {
      id: "menu_relatorios",
      name: "Relatórios",
      description: "Relatórios e análises",
      category: "menus",
    },
    {
      id: "menu_portais",
      name: "Portais",
      description: "Integração com portais",
      category: "menus",
    },
    {
      id: "menu_loja_ias",
      name: "Loja de IAs",
      description: "Acesso à loja de IAs",
      category: "menus",
    },
    {
      id: "menu_conhecimento",
      name: "Conhecimento",
      description: "Base de conhecimento",
      category: "menus",
    },
    {
      id: "menu_conversas",
      name: "Conversas",
      description: "Conversas com clientes",
      category: "menus",
    },

    // Feature Permissions
    {
      id: "feature_add_client",
      name: "Adicionar Clientes",
      description: "Criar novos clientes",
      category: "features",
    },
    {
      id: "feature_edit_client",
      name: "Editar Clientes",
      description: "Modificar dados de clientes",
      category: "features",
    },
    {
      id: "feature_delete_client",
      name: "Excluir Clientes",
      description: "Remover clientes do sistema",
      category: "features",
    },
    {
      id: "feature_add_event",
      name: "Adicionar Eventos",
      description: "Criar novos eventos na agenda",
      category: "features",
    },
    {
      id: "feature_edit_event",
      name: "Editar Eventos",
      description: "Modificar eventos existentes",
      category: "features",
    },
    {
      id: "feature_delete_event",
      name: "Excluir Eventos",
      description: "Remover eventos da agenda",
      category: "features",
    },
    {
      id: "feature_add_contract",
      name: "Adicionar Contratos",
      description: "Criar novos contratos",
      category: "features",
    },
    {
      id: "feature_edit_contract",
      name: "Editar Contratos",
      description: "Modificar contratos existentes",
      category: "features",
    },
    {
      id: "feature_delete_contract",
      name: "Excluir Contratos",
      description: "Remover contratos do sistema",
      category: "features",
    },
    {
      id: "feature_add_connection",
      name: "Adicionar Conexões",
      description: "Criar novas conexões WhatsApp",
      category: "features",
    },
    {
      id: "feature_manage_connection",
      name: "Gerenciar Conexões",
      description: "Gerenciar conexões existentes",
      category: "features",
    },

    // Admin Permissions
    {
      id: "admin_manage_users",
      name: "Gerenciar Usuários",
      description: "Adicionar, editar e remover usuários",
      category: "admin",
    },
    {
      id: "admin_manage_roles",
      name: "Gerenciar Papéis",
      description: "Configurar papéis e permissões",
      category: "admin",
    },
    {
      id: "admin_view_logs",
      name: "Visualizar Logs",
      description: "Acessar logs do sistema",
      category: "admin",
    },
    {
      id: "admin_system_settings",
      name: "Configurações do Sistema",
      description: "Alterar configurações globais",
      category: "admin",
    },
  ]);

  // Define roles with their permissions
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "corretor",
      name: "Corretor",
      icon: <User className="h-5 w-5 text-white" />,
      color: "#10b981", // green
      permissions: [
        "menu_dashboard",
        "menu_agenda",
        "menu_clientes",
        "menu_contratos",
        "menu_conversas",
        "feature_add_client",
        "feature_edit_client",
        "feature_add_event",
        "feature_edit_event",
        "feature_delete_event",
      ],
    },
    {
      id: "gestor",
      name: "Gestor",
      icon: <Shield className="h-5 w-5 text-white" />,
      color: "#3b82f6", // blue
      permissions: [
        "menu_dashboard",
        "menu_agenda",
        "menu_clientes",
        "menu_contratos",
        "menu_conexoes",
        "menu_relatorios",
        "menu_conversas",
        "menu_conhecimento",
        "feature_add_client",
        "feature_edit_client",
        "feature_delete_client",
        "feature_add_event",
        "feature_edit_event",
        "feature_delete_event",
        "feature_add_contract",
        "feature_edit_contract",
        "feature_delete_contract",
        "feature_add_connection",
        "feature_manage_connection",
      ],
    },
    {
      id: "administrador",
      name: "Administrador",
      icon: <Crown className="h-5 w-5 text-white" />,
      color: "#ef4444", // red
      permissions: [
        "menu_dashboard",
        "menu_agenda",
        "menu_clientes",
        "menu_contratos",
        "menu_conexoes",
        "menu_relatorios",
        "menu_portais",
        "menu_loja_ias",
        "menu_conhecimento",
        "menu_conversas",
        "feature_add_client",
        "feature_edit_client",
        "feature_delete_client",
        "feature_add_event",
        "feature_edit_event",
        "feature_delete_event",
        "feature_add_contract",
        "feature_edit_contract",
        "feature_delete_contract",
        "feature_add_connection",
        "feature_manage_connection",
        "admin_manage_users",
        "admin_manage_roles",
        "admin_view_logs",
        "admin_system_settings",
      ],
    },
  ]);

  // State for the selected role
  const [selectedRoleId, setSelectedRoleId] = useState<string>("corretor");

  // Get the selected role
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) || roles[0];

  // Toggle a permission for the selected role
  const togglePermission = (permissionId: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id === selectedRoleId) {
          const hasPermission = role.permissions.includes(permissionId);
          const newPermissions = hasPermission
            ? role.permissions.filter((id) => id !== permissionId)
            : [...role.permissions, permissionId];

          return { ...role, permissions: newPermissions };
        }
        return role;
      }),
    );
  };

  // Get permissions by category
  const getPermissionsByCategory = (category: string) => {
    return permissions.filter((permission) => permission.category === category);
  };

  // Pre-filter permissions by category for better performance
  const menuPermissions = getPermissionsByCategory("menus");
  const featurePermissions = getPermissionsByCategory("features");
  const adminPermissions = getPermissionsByCategory("admin");

  // Get icon for permission (removed; child component does not need it directly)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Sistema de Permissões
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure o acesso às funcionalidades por tipo de usuário
        </p>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            id={role.id}
            name={role.name}
            icon={role.icon}
            color={role.color}
            activePermissions={role.permissions.length}
            totalPermissions={permissions.length}
            isSelected={selectedRoleId === role.id}
            onSelect={() => setSelectedRoleId(role.id)}
          />
        ))}
      </div>

      {/* Role Selection Tabs */}
      <RoleTabs
        roles={roles.map(r => ({ id: r.id, name: r.name, color: r.color }))}
        selectedRoleId={selectedRoleId}
        onSelect={setSelectedRoleId}
      />

      {/* Permissions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedRole.color }}>
              {selectedRole.id === 'corretor' && <User className="h-6 w-6 text-white" />}
              {selectedRole.id === 'gestor' && <Shield className="h-6 w-6 text-white" />}
              {selectedRole.id === 'administrador' && <Crown className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">Permissões - {selectedRole.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">Controle o acesso às funcionalidades do sistema</p>
            </div>
          </div>
        </div>

        <PermissionsSection
          title="Menus de Navegação"
          icon={<Menu className="h-5 w-5 text-gray-500" />}
          permissions={menuPermissions}
          selectedPermissions={selectedRole.permissions}
          onToggle={togglePermission}
        />
        <PermissionsSection
          title="Funcionalidades"
          icon={<Settings className="h-5 w-5 text-gray-500" />}
          permissions={featurePermissions}
          selectedPermissions={selectedRole.permissions}
          onToggle={togglePermission}
        />
        <PermissionsSection
          title="Administração"
          icon={<Shield className="h-5 w-5 text-gray-500" />}
          permissions={adminPermissions}
          selectedPermissions={selectedRole.permissions}
          onToggle={togglePermission}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default PermissionsManager;
