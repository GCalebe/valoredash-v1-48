import React from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserFormData } from "@/types/user";

interface UserDialogsProps {
  // Add User Dialog
  isAddUserDialogOpen: boolean;
  setIsAddUserDialogOpen: (open: boolean) => void;
  newUser: UserFormData;
  setNewUser: (user: UserFormData) => void;
  handleAddUser: () => void;

  // Edit User Dialog
  isEditUserDialogOpen: boolean;
  setIsEditUserDialogOpen: (open: boolean) => void;
  selectedUser: User | null;
  handleEditUser: () => void;

  // Delete User Dialog
  isDeleteUserDialogOpen: boolean;
  setIsDeleteUserDialogOpen: (open: boolean) => void;
  handleDeleteUser: () => void;

  // AI Products
  aiProducts: unknown[];
}

export const UserDialogs: React.FC<UserDialogsProps> = ({
  isAddUserDialogOpen,
  setIsAddUserDialogOpen,
  newUser,
  setNewUser,
  handleAddUser,
  isEditUserDialogOpen,
  setIsEditUserDialogOpen,
  selectedUser,
  handleEditUser,
  isDeleteUserDialogOpen,
  setIsDeleteUserDialogOpen,
  handleDeleteUser,
  aiProducts,
}) => {
  return (
    <>
      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="col-span-3"
                placeholder="usuario@empresa.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="col-span-3"
                placeholder="********"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nome
              </Label>
              <Input
                id="full_name"
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
                className="col-span-3"
                placeholder="Nome completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Papel
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "admin" | "user") =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">IAs</Label>
              <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto">
                {aiProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={newUser.ai_access.includes(product.id)}
                      onCheckedChange={(checked) => {
                        const updatedAccess = checked
                          ? [...newUser.ai_access, product.id]
                          : newUser.ai_access.filter((id) => id !== product.id);
                        setNewUser({ ...newUser, ai_access: updatedAccess });
                      }}
                    />
                    <Label htmlFor={product.id} className="text-sm">
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
            <Button onClick={handleAddUser}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique os dados do usuário selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_full_name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit_full_name"
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_role" className="text-right">
                Papel
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "admin" | "user") =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">IAs</Label>
              <div className="col-span-3 space-y-2 max-h-32 overflow-y-auto">
                {aiProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit_${product.id}`}
                      checked={newUser.ai_access.includes(product.id)}
                      onCheckedChange={(checked) => {
                        const updatedAccess = checked
                          ? [...newUser.ai_access, product.id]
                          : newUser.ai_access.filter((id) => id !== product.id);
                        setNewUser({ ...newUser, ai_access: updatedAccess });
                      }}
                    />
                    <Label htmlFor={`edit_${product.id}`} className="text-sm">
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
            <Button onClick={handleEditUser}>Salvar</Button>
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
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              {selectedUser?.full_name || selectedUser?.email}? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteUserDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
