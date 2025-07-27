import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ObjectionsManager from "./ObjectionsManager";
import { ProductObjection, ProductFormData } from "@/types/product";
import { 
  Plus, 
  Minus, 
  Package, 
  DollarSign, 
  FileText, 
  Tag,
  Award,
  Target,
  TrendingUp,
  type LucideIcon
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser positivo").optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  differentials: z.array(z.string()).default([]),
  success_cases: z.array(z.string()).default([]),
  icon: z.string().optional(),
  image: z.string().optional(),
  has_combo: z.boolean().default(false),
  has_upgrade: z.boolean().default(false),
  has_promotion: z.boolean().default(false),
  new: z.boolean().default(false),
  popular: z.boolean().default(false),
});

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  mode
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [objections, setObjections] = useState<ProductObjection[]>([]);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
      benefits: [],
      objections: [],
      differentials: [],
      success_cases: [],
      icon: "",
      image: "",
      has_combo: false,
      has_upgrade: false,
      has_promotion: false,
      new: false,
      popular: false,
      ...initialData,
    },
  });

  const watchedValues = watch();

  const handleArrayAdd = (field: keyof Pick<ProductFormData, 'benefits' | 'objections' | 'differentials' | 'success_cases'>, value: string) => {
    if (value.trim()) {
      const currentArray = watchedValues[field] || [];
      setValue(field, [...currentArray, value.trim()]);
    }
  };

  const handleArrayRemove = (field: keyof Pick<ProductFormData, 'benefits' | 'objections' | 'differentials' | 'success_cases'>, index: number) => {
    const currentArray = watchedValues[field] || [];
    setValue(field, currentArray.filter((_, i) => i !== index));
  };

  const ArrayInputField = ({ 
    field, 
    label, 
    placeholder, 
    icon: Icon 
  }: { 
    field: keyof Pick<ProductFormData, 'benefits' | 'objections' | 'differentials' | 'success_cases'>;
    label: string;
    placeholder: string;
    icon: LucideIcon;
  }) => {
    const [inputValue, setInputValue] = useState("");
    const items = watchedValues[field] || [];

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleArrayAdd(field, inputValue);
                setInputValue("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              handleArrayAdd(field, inputValue);
              setInputValue("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item: string, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1"
            >
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => handleArrayRemove(field, index)}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    console.log('🔍 ProductForm handleFormSubmit called');
    console.log('📝 Form data received:', data);
    console.log('🎯 Current objections state:', objections);
    console.log('🔧 Mode:', mode);
    console.log('📋 Initial data:', initialData);
    
    try {
      // Include objections from ObjectionsManager in the form data
      const formDataWithObjections = {
        ...data,
        objections: objections.map(obj => obj.question) // Convert ProductObjection[] to string[]
      };
      
      console.log('📦 Final form data with objections:', formDataWithObjections);
      console.log('🚀 Calling onSubmit...');
      
      await onSubmit(formDataWithObjections);
      
      console.log('✅ onSubmit completed successfully');
    } catch (error) {
      console.error('❌ Error in handleFormSubmit:', error);
      throw error;
    }
  };

  const onFormSubmit = (data: ProductFormData) => {
    console.log('🎯 react-hook-form handleSubmit called');
    console.log('📋 Form validation passed, calling handleFormSubmit...');
    return handleFormSubmit(data);
  };

  const onFormError = (errors: any) => {
    console.log('❌ react-hook-form validation failed');
    console.log('🚨 Form errors:', errors);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Produto/Serviço *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ex: Consultoria em Marketing Digital"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Preço (R$) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categoria
                </Label>
                <Input
                  id="category"
                  {...register("category")}
                  placeholder="Ex: Consultoria, Software, Curso..."
                />
              </div>

              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Descreva seu produto ou serviço..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Benefícios e Diferenciais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ArrayInputField
                field="benefits"
                label="Benefícios"
                placeholder="Adicione um benefício..."
                icon={TrendingUp}
              />
              
              <ArrayInputField
                field="differentials"
                label="Diferenciais"
                placeholder="Adicione um diferencial..."
                icon={Award}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Marketing e Vendas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ObjectionsManager
                productId={initialData?.id}
                onObjectionsChange={setObjections}
                initialObjections={initialData?.objections?.map((question, index) => ({
                  id: `initial-${index}`,
                  question,
                  answer: 'Resposta não definida'
                })) || []}
              />
              
              <ArrayInputField
                field="success_cases"
                label="Casos de Sucesso"
                placeholder="Adicione um caso de sucesso..."
                icon={Award}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Configurações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has_promotion"
                  checked={watchedValues.has_promotion}
                  onCheckedChange={(checked) => setValue("has_promotion", checked)}
                />
                <Label htmlFor="has_promotion">Em promoção</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="has_combo"
                  checked={watchedValues.has_combo}
                  onCheckedChange={(checked) => setValue("has_combo", checked)}
                />
                <Label htmlFor="has_combo">Oferece combo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="has_upgrade"
                  checked={watchedValues.has_upgrade}
                  onCheckedChange={(checked) => setValue("has_upgrade", checked)}
                />
                <Label htmlFor="has_upgrade">Oferece upgrade</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="new"
                  checked={watchedValues.new}
                  onCheckedChange={(checked) => setValue("new", checked)}
                />
                <Label htmlFor="new">Produto novo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={watchedValues.popular}
                  onCheckedChange={(checked) => setValue("popular", checked)}
                />
                <Label htmlFor="popular">Produto popular</Label>
              </div>

              <div>
                <Label htmlFor="icon">Ícone (URL)</Label>
                <Input
                  id="icon"
                  {...register("icon")}
                  placeholder="https://exemplo.com/icone.png"
                />
              </div>

              <div>
                <Label htmlFor="image">Imagem (URL)</Label>
                <Input
                  id="image"
                  {...register("image")}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isLoading}
          onClick={() => {
            console.log('🖱️ Submit button clicked');
            console.log('🔧 Button mode:', mode);
            console.log('⏳ Is loading:', isLoading);
            console.log('📝 Current form values:', watchedValues);
          }}
        >
          {isLoading ? "Salvando..." : mode === "create" ? "Criar Produto" : "Atualizar Produto"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;