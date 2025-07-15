
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Clock, Edit, Trash2, Calendar, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DaySelector from "./DaySelector";
import ProductSelector from "./ProductSelector";

type Employee = Database['public']['Tables']['employees']['Row'];
type EmployeeService = Database['public']['Tables']['employee_services']['Row'];

const EmployeesTab = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeServices, setEmployeeServices] = useState<EmployeeService[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    available_hours: [] as string[],
    available_days: [] as string[],
    selectedProducts: [] as Array<{
      product_id: string;
      available_days: string[];
    }>,
  });

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  useEffect(() => {
    if (user) {
      fetchEmployees();
      fetchEmployeeServices();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
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

  const fetchEmployeeServices = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_services")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      setEmployeeServices(data as EmployeeService[] || []);
    } catch (error) {
      console.error("Erro ao buscar serviços dos funcionários:", error);
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
      let employeeId: string;

      if (editingEmployee) {
        // Update employee
        const { error } = await supabase
          .from("employees")
          .update({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            available_hours: formData.available_hours,
            available_days: formData.available_days,
          })
          .eq("id", editingEmployee.id);

        if (error) throw error;
        employeeId = editingEmployee.id;

        // Delete existing employee services
        await supabase
          .from("employee_services")
          .delete()
          .eq("employee_id", employeeId);
        
        toast({
          title: "Sucesso",
          description: "Funcionário atualizado com sucesso!",
        });
      } else {
        // Create new employee
        const { data, error } = await supabase
          .from("employees")
          .insert({
            name: formData.name,
            role: formData.role,
            description: formData.description,
            available_hours: formData.available_hours,
            available_days: formData.available_days,
            user_id: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        employeeId = data.id;
        
        toast({
          title: "Sucesso",
          description: "Funcionário adicionado com sucesso!",
        });
      }

      // Insert employee services
      if (formData.selectedProducts.length > 0) {
        const serviceInserts = formData.selectedProducts.map(product => ({
          employee_id: employeeId,
          product_id: product.product_id,
          available_days: product.available_days,
          user_id: user?.id,
        }));

        const { error: servicesError } = await supabase
          .from("employee_services")
          .insert(serviceInserts);

        if (servicesError) throw servicesError;
      }

      resetForm();
      setIsDialogOpen(false);
      fetchEmployees();
      fetchEmployeeServices();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o funcionário.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (employee: Employee) => {
    setEditingEmployee(employee);
    
    // Fetch employee services
    const { data: services } = await supabase
      .from("employee_services")
      .select("*")
      .eq("employee_id", employee.id);

    const selectedProducts = services?.map(service => ({
      product_id: service.product_id,
      available_days: service.available_days || [],
    })) || [];

    setFormData({
      name: employee.name,
      role: employee.role,
      description: employee.description || "",
      available_hours: employee.available_hours || [],
      available_days: employee.available_days || [],
      selectedProducts,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Funcionário excluído com sucesso!",
      });
      
      fetchEmployees();
      fetchEmployeeServices();
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
    setFormData({ 
      name: "", 
      role: "", 
      description: "", 
      available_hours: [], 
      available_days: [],
      selectedProducts: []
    });
    setEditingEmployee(null);
  };

  const getEmployeeServices = (employeeId: string) => {
    return employeeServices.filter(service => service.employee_id === employeeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Funcionários
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie os funcionários, seus horários e produtos/serviços associados
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <DaySelector
                selectedDays={formData.available_days}
                onSelectionChange={(days) => setFormData(prev => ({ ...prev, available_days: days }))}
                label="Dias da Semana Disponíveis"
              />

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

              <ProductSelector
                selectedProducts={formData.selectedProducts}
                onSelectionChange={(products) => setFormData(prev => ({ ...prev, selectedProducts: products }))}
              />

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
        {employees.map((employee) => {
          const services = getEmployeeServices(employee.id);
          
          return (
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
              
              <CardContent className="space-y-3">
                {employee.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {employee.description}
                  </p>
                )}

                {employee.available_days && employee.available_days.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Dias disponíveis:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {employee.available_days.slice(0, 3).map((day) => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {day.slice(0, 3)}
                        </Badge>
                      ))}
                      {employee.available_days.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{employee.available_days.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
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

                {services.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Produtos/Serviços:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {services.slice(0, 2).map((service) => (
                        <Badge key={service.id} variant="outline" className="text-xs bg-purple-50">
                          Produto ID: {service.product_id.slice(0, 8)}...
                        </Badge>
                      ))}
                      {services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{services.length - 2} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
