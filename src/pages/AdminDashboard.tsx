import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Shield, Bot, LockKeyhole } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { User, UserFormData } from "@/types/user";
import { useAIProductsQuery } from "@/hooks/useAIProductsQuery";
import PermissionsManager from "@/components/admin/PermissionsManager";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { AIAccessTab } from "@/components/admin/AIAccessTab";
import { UserDialogs } from "@/components/admin/UserDialogs";

const AdminDashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, loading, fetchUsers, addUser, updateUser, deleteUser } =
    useUsers();
  const { data: aiProducts = [] } = useAIProductsQuery();

  const [activeTab, setActiveTab] = useState("users");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<UserFormData>({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    ai_access: [],
  });

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, navigate, toast]);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({
        title: "Campos obrigatórios",
        description: "Email, senha e nome são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const success = await addUser(newUser);
    if (success) {
      setIsAddUserDialogOpen(false);
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "user",
        ai_access: [],
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    const success = await updateUser(selectedUser.id, {
      full_name: newUser.full_name,
      role: newUser.role,
      ai_access: newUser.ai_access,
    });

    if (success) {
      setIsEditUserDialogOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const success = await deleteUser(selectedUser.id);
    if (success) {
      setIsDeleteUserDialogOpen(false);
    }
  };

  // Handler functions for user management
  const handleAddUserClick = () => setIsAddUserDialogOpen(true);

  const handleEditUserClick = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      role: user.role,
      ai_access: user.ai_access,
    });
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <AdminHeader user={user} settings={settings} onSignOut={signOut} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Painel de Administração
          </h2>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários, IAs e configurações do sistema
          </p>
        </div>

        <AdminStats users={users} aiProducts={aiProducts} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="ai-access" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Acesso às IAs</span>
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex items-center gap-2"
            >
              <LockKeyhole className="h-4 w-4" />
              <span className="hidden sm:inline">Permissões</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagementTab
              users={users}
              aiProducts={aiProducts}
              loading={loading}
              onAddUser={handleAddUserClick}
              onEditUser={handleEditUserClick}
              onDeleteUser={handleDeleteUserClick}
              onRefresh={fetchUsers}
            />
          </TabsContent>

          <TabsContent value="ai-access">
            <AIAccessTab users={users} aiProducts={aiProducts} />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsManager />
          </TabsContent>
        </Tabs>

        <UserDialogs
          isAddUserDialogOpen={isAddUserDialogOpen}
          setIsAddUserDialogOpen={setIsAddUserDialogOpen}
          newUser={newUser}
          setNewUser={setNewUser}
          handleAddUser={handleAddUser}
          isEditUserDialogOpen={isEditUserDialogOpen}
          setIsEditUserDialogOpen={setIsEditUserDialogOpen}
          selectedUser={selectedUser}
          handleEditUser={handleEditUser}
          isDeleteUserDialogOpen={isDeleteUserDialogOpen}
          setIsDeleteUserDialogOpen={setIsDeleteUserDialogOpen}
          handleDeleteUser={handleDeleteUser}
          aiProducts={aiProducts}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
