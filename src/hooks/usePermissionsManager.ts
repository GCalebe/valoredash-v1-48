import { useState } from "react";
import { User, Shield, Crown } from "lucide-react";

export interface Role {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const usePermissionsManager = () => {
  const [permissions] = useState<Permission[]>([
    { id: "menu_dashboard", name: "Dashboard", description: "Acesso ao painel principal", category: "menus" },
    { id: "menu_agenda", name: "Agenda", description: "Agenda de compromissos", category: "menus" },
    { id: "menu_clientes", name: "Clientes", description: "Gerenciamento de clientes", category: "menus" },
    { id: "menu_contratos", name: "Contratos", description: "Gerenciar contratos", category: "menus" },
    { id: "menu_conexoes", name: "Conexões WhatsApp", description: "WhatsApp", category: "menus" },
    { id: "menu_relatorios", name: "Relatórios", description: "Relatórios e análises", category: "menus" },
    { id: "menu_portais", name: "Portais", description: "Integração com portais", category: "menus" },
    { id: "menu_loja_ias", name: "Loja de IAs", description: "Acesso à loja de IAs", category: "menus" },
    { id: "menu_conhecimento", name: "Conhecimento", description: "Base de conhecimento", category: "menus" },
    { id: "menu_conversas", name: "Conversas", description: "Conversas com clientes", category: "menus" },

    { id: "feature_add_client", name: "Adicionar Clientes", description: "Criar novos clientes", category: "features" },
    { id: "feature_edit_client", name: "Editar Clientes", description: "Modificar dados de clientes", category: "features" },
    { id: "feature_delete_client", name: "Excluir Clientes", description: "Remover clientes do sistema", category: "features" },
    { id: "feature_add_event", name: "Adicionar Eventos", description: "Criar novos eventos na agenda", category: "features" },
    { id: "feature_edit_event", name: "Editar Eventos", description: "Modificar eventos existentes", category: "features" },
    { id: "feature_delete_event", name: "Excluir Eventos", description: "Remover eventos da agenda", category: "features" },
    { id: "feature_add_contract", name: "Adicionar Contratos", description: "Criar novos contratos", category: "features" },
    { id: "feature_edit_contract", name: "Editar Contratos", description: "Modificar contratos existentes", category: "features" },
    { id: "feature_delete_contract", name: "Excluir Contratos", description: "Remover contratos do sistema", category: "features" },
    { id: "feature_add_connection", name: "Adicionar Conexões", description: "Criar novas conexões WhatsApp", category: "features" },
    { id: "feature_manage_connection", name: "Gerenciar Conexões", description: "Gerenciar conexões existentes", category: "features" },

    { id: "admin_manage_users", name: "Gerenciar Usuários", description: "Adicionar, editar e remover usuários", category: "admin" },
    { id: "admin_manage_roles", name: "Gerenciar Papéis", description: "Configurar papéis e permissões", category: "admin" },
    { id: "admin_view_logs", name: "Visualizar Logs", description: "Acessar logs do sistema", category: "admin" },
    { id: "admin_system_settings", name: "Configurações do Sistema", description: "Alterar configurações globais", category: "admin" },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "corretor",
      name: "Corretor",
      icon: <User className="h-5 w-5 text-white" />,
      color: "#10b981",
      permissions: [
        "menu_dashboard", "menu_agenda", "menu_clientes", "menu_contratos", "menu_conversas",
        "feature_add_client", "feature_edit_client",
        "feature_add_event", "feature_edit_event", "feature_delete_event"
      ],
    },
    {
      id: "gestor",
      name: "Gestor",
      icon: <Shield className="h-5 w-5 text-white" />,
      color: "#3b82f6",
      permissions: [
        "menu_dashboard", "menu_agenda", "menu_clientes", "menu_contratos", "menu_conexoes",
        "menu_relatorios", "menu_conversas", "menu_conhecimento",
        "feature_add_client", "feature_edit_client", "feature_delete_client",
        "feature_add_event", "feature_edit_event", "feature_delete_event",
        "feature_add_contract", "feature_edit_contract", "feature_delete_contract",
        "feature_add_connection", "feature_manage_connection"
      ],
    },
    {
      id: "administrador",
      name: "Administrador",
      icon: <Crown className="h-5 w-5 text-white" />,
      color: "#ef4444",
      permissions: [
        "menu_dashboard", "menu_agenda", "menu_clientes", "menu_contratos", "menu_conexoes",
        "menu_relatorios", "menu_portais", "menu_loja_ias", "menu_conhecimento", "menu_conversas",
        "feature_add_client", "feature_edit_client", "feature_delete_client",
        "feature_add_event", "feature_edit_event", "feature_delete_event",
        "feature_add_contract", "feature_edit_contract", "feature_delete_contract",
        "feature_add_connection", "feature_manage_connection",
        "admin_manage_users", "admin_manage_roles", "admin_view_logs", "admin_system_settings"
      ],
    },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("corretor");

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const togglePermission = (permissionId: string) => {
    setRoles(prev =>
      prev.map(role => {
        if (role.id === selectedRoleId) {
          const has = role.permissions.includes(permissionId);
          const newPerms = has ? role.permissions.filter(id => id !== permissionId) : [...role.permissions, permissionId];
          return { ...role, permissions: newPerms };
        }
        return role;
      })
    );
  };

  const getPermissionsByCategory = (category: string) => permissions.filter(p => p.category === category);

  const menuPermissions = getPermissionsByCategory("menus");
  const featurePermissions = getPermissionsByCategory("features");
  const adminPermissions = getPermissionsByCategory("admin");

  const calculatePermissionPercentage = (role: Role) => {
    return Math.round((role.permissions.length / permissions.length) * 100);
  };

  return {
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
  };
};

export default usePermissionsManager;
