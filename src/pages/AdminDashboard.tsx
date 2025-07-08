import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShipWheel,
  LogOut,
  Users,
  Settings,
  Shield,
  UserPlus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  Bot,
  Check,
  X,
  LockKeyhole,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { User, UserFormData } from "@/types/user";
import { useAIProductsQuery } from "@/hooks/useAIProductsQuery";
import PermissionsManager from "@/components/admin/PermissionsManager";

const AdminDashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, loading, fetchUsers, addUser, updateUser, deleteUser } = useUsers();
  const { data: aiProducts = [] } = useAIProductsQuery();

  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name &&
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  // Get AI product names from IDs
  const getAIProductNames = (aiIds: string[]) => {
    if (!aiProducts || aiProducts.length === 0) {
      // Fallback to mock data if Supabase data not available
      return aiIds.map(id => id);
    }
    return aiIds.map(id => {
      const product = aiProducts.find(p => p.id === id);
      return product ? product.name : id;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header
        className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 focus-visible:ring-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <ShipWheel
                className="h-8 w-8"
                style={{ color: settings.secondaryColor }}
              />
            )}
            <h1 className="text-2xl font-bold">{settings.brandName}</h1>
            <span className="text-lg ml-2">Administração</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-0 px-3 py-1"
            >
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={signOut}
              className="border-white text-white bg-transparent hover:bg-white/20"
              style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Painel de Administração
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie usuários, IAs e configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Usuários
              </CardTitle>
              <CardDescription>Total de usuários no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Administradores
              </CardTitle>
              <CardDescription>Usuários com acesso admin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                IAs Ativas
              </CardTitle>
              <CardDescription>IAs em uso pelos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Array.from(new Set(users.flatMap(u => u.ai_access))).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Configurações
              </CardTitle>
              <CardDescription>Opções do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/theme-settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações de Tema
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="ai-access" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Acesso às IAs
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4" />
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <Button
                    onClick={() => setIsAddUserDialogOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex justify-between items-center">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    {loading ? "Carregando..." : "Atualizar"}
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>IAs Acessíveis</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex justify-center items-center">
                              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                              <span className="ml-2 text-gray-500">
                                Carregando usuários...
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <span className="text-gray-500">
                              Nenhum usuário encontrado
                            </span>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.full_name || "Sem nome"}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin" ? "default" : "secondary"
                                }
                              >
                                {user.role === "admin" ? "Admin" : "Usuário"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.ai_access.length > 0 ? (
                                  user.ai_access.length > 3 ? (
                                    <>
                                      {user.ai_access.slice(0, 2).map((aiId) => {
                                        const ai = aiProducts.find(p => p.id === aiId);
                                        return (
                                          <Badge key={aiId} variant="outline" className="text-xs">
                                            {ai ? ai.name : aiId}
                                          </Badge>
                                        );
                                      })}
                                      <Badge variant="outline" className="text-xs">
                                        +{user.ai_access.length - 2} mais
                                      </Badge>
                                    </>
                                  ) : (
                                    user.ai_access.map((aiId) => {
                                      const ai = aiProducts.find(p => p.id === aiId);
                                      return (
                                        <Badge key={aiId} variant="outline" className="text-xs">
                                          {ai ? ai.name : aiId}
                                        </Badge>
                                      );
                                    })
                                  )
                                ) : (
                                  <span className="text-gray-500 text-sm">Nenhuma</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString(
                                "pt-BR"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setNewUser({
                                      email: user.email,
                                      password: "",
                                      full_name: user.full_name || "",
                                      role: user.role,
                                      ai_access: user.ai_access,
                                    });
                                    setIsEditUserDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteUserDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-access">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Acesso às Inteligências Artificiais
                </CardTitle>
                <CardDescription>
                  Visualize quais usuários têm acesso a cada IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IA</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Usuários com Acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8">
                            <div className="flex justify-center items-center">
                              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                              <span className="ml-2 text-gray-500">
                                Carregando dados...
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        aiProducts.map((product) => {
                          const usersWithAccess = users.filter(user => 
                            user.ai_access.includes(product.id)
                          );
                          
                          return (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                                    <product.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span className="font-medium">{product.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{product.category}</Badge>
                              </TableCell>
                              <TableCell>
                                {usersWithAccess.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {usersWithAccess.map(user => (
                                      <Badge 
                                        key={user.id} 
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {user.full_name || user.email}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">Nenhum usuário</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add User Dialog */}
      <Dialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie uma nova conta de usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="********"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                  placeholder="Nome do Usuário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Papel *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: 'admin' | 'user') =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione um papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Acesso às IAs</Label>
              <p className="text-sm text-gray-500 mb-2">
                Selecione as IAs que este usuário poderá acessar:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {aiProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`ai-${product.id}`} 
                      checked={newUser.ai_access.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewUser({
                            ...newUser,
                            ai_access: [...newUser.ai_access, product.id]
                          });
                        } else {
                          setNewUser({
                            ...newUser,
                            ai_access: newUser.ai_access.filter(id => id !== product.id)
                          });
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`ai-${product.id}`}
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <product.icon className="h-3.5 w-3.5 text-blue-600" />
                      {product.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddUserDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddUser}>Adicionar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newUser.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-full_name">Nome Completo</Label>
                <Input
                  id="edit-full_name"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                  placeholder="Nome do Usuário"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Papel</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: 'admin' | 'user') =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Acesso às IAs</Label>
              <p className="text-sm text-gray-500 mb-2">
                Selecione as IAs que este usuário poderá acessar:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {aiProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit-ai-${product.id}`} 
                      checked={newUser.ai_access.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewUser({
                            ...newUser,
                            ai_access: [...newUser.ai_access, product.id]
                          });
                        } else {
                          setNewUser({
                            ...newUser,
                            ai_access: newUser.ai_access.filter(id => id !== product.id)
                          });
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`edit-ai-${product.id}`}
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <product.icon className="h-3.5 w-3.5 text-blue-600" />
                      {product.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditUserDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {selectedUser.full_name || "Sem nome"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Papel:</strong>{" "}
                  {selectedUser.role === "admin" ? "Administrador" : "Usuário"}
                </p>
                <p>
                  <strong>IAs com acesso:</strong>{" "}
                  {selectedUser.ai_access.length > 0 
                    ? getAIProductNames(selectedUser.ai_access).join(", ")
                    : "Nenhuma"}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteUserDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Excluir Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;