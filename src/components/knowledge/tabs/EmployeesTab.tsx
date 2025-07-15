import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Clock, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  role: string;
  description: string;
  available_hours: string[];
  created_at: string;
  user_id: string;
}

const EmployeesTab = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    available_hours: [] as string[],
  });

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("employees")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data as Employee[] || []);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      toast({
        title: "Erro",
        description: "Nome e função são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingEmployee) {
        const { error } = await (supabase as any)
          .from("employees")
          .update({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            available_hours: formData.available_hours,
          })
          .eq("id", editingEmployee.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Funcionário atualizado com sucesso!",
        });
      } else {
        const { error } = await (supabase as any)
          .from("employees")
          .insert({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            available_hours: formData.available_hours,
            user_id: user?.id,
          });

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Funcionário adicionado com sucesso!",
        });
      }

      setFormData({ name: "", role: "", description: "", available_hours: [] });
      setEditingEmployee(null);
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o funcionário.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      description: employee.description,
      available_hours: employee.available_hours || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
      const { error } = await (supabase as any)
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Funcionário excluído com sucesso!",
      });
      
      fetchEmployees();
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o funcionário.",
        variant: "destructive",
      });
    }
  };

  const toggleAvailableHour = (hour: string) => {
    setFormData(prev => ({
      ...prev,
      available_hours: prev.available_hours.includes(hour)
        ? prev.available_hours.filter(h => h !== hour)
        : [...prev.available_hours, hour]
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", role: "", description: "", available_hours: [] });
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Funcionários
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie os funcionários e seus horários de disponibilidade
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Função *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Ex: Desenvolvedor, Designer, etc."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição das responsabilidades e habilidades"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Horários Disponíveis</Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      variant={formData.available_hours.includes(hour) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAvailableHour(hour)}
                      className="text-xs"
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-base">{employee.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {employee.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {employee.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {employee.description}
                </p>
              )}
              
              {employee.available_hours && employee.available_hours.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Horários disponíveis:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {employee.available_hours.slice(0, 6).map((hour) => (
                      <Badge key={hour} variant="outline" className="text-xs">
                        {hour}
                      </Badge>
                    ))}
                    {employee.available_hours.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{employee.available_hours.length - 6} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhum funcionário cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece adicionando funcionários à sua equipe
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;