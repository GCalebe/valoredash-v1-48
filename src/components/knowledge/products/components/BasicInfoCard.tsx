import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, DollarSign, FileText, Tag } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ProductFormData } from "@/types/product";

interface BasicInfoCardProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ register, errors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Produto/Serviço</Label>
          <Input id="name" {...register("name")} placeholder="Ex: Consultoria em Marketing Digital" />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="price" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Preço (R$)
          </Label>
          <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} placeholder="0,00" />
          {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="category" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categoria
          </Label>
          <Input id="category" {...register("category") } placeholder="Ex: Consultoria, Software, Curso..." />
        </div>

        <div>
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Descrição
          </Label>
          <Textarea id="description" {...register("description")} placeholder="Descreva seu produto ou serviço..." rows={3} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoCard;


