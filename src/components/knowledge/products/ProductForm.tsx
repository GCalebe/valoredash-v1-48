// @ts-nocheck
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
//
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
//
import ArrayInputField from "./components/ArrayInputField";
//
import BasicInfoCard from "./components/BasicInfoCard";
import MarketingCard from "./components/MarketingCard";
import { ProductObjection, ProductFormData } from "@/types/product";
import { Award, TrendingUp } from "lucide-react";
import ProductSettingsCard from "./components/ProductSettingsCard";

const productSchema = z.object({
  name: z.string().nullable().optional(),
  price: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0, "Preço deve ser positivo").nullable().optional()),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  benefits: z.array(z.string()).nullable().optional(),
  objections: z.array(z.string()).nullable().optional(),
  differentials: z.array(z.string()).nullable().optional(),
  success_cases: z.array(z.string()).nullable().optional(),
  icon: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  has_combo: z.boolean().nullable().optional(),
  has_upgrade: z.boolean().nullable().optional(),
  has_promotion: z.boolean().nullable().optional(),
  new: z.boolean().nullable().optional(),
  popular: z.boolean().nullable().optional(),
  // Campos condicionais para promoção
  promotion_name: z.string().nullable().optional(),
  promotion_description: z.string().nullable().optional(),
  discount_type: z.enum(["percentage", "fixed"]).nullable().optional(),
  discount_percentage: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).max(100).nullable().optional()),
  discount_amount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).nullable().optional()),
  promotion_start_date: z.string().nullable().optional(),
  promotion_end_date: z.string().nullable().optional(),
  // Campos condicionais para combo
  combo_name: z.string().nullable().optional(),
  combo_description: z.string().nullable().optional(),
  combo_products: z.array(z.string()).nullable().optional(),
  combo_benefit: z.string().nullable().optional(),
  combo_discount_percentage: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).max(100).nullable().optional()),
  // Campos condicionais para upgrade
  upgrade_name: z.string().nullable().optional(),
  upgrade_description: z.string().nullable().optional(),
  upgrade_price: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).nullable().optional()),
  upgrade_benefits: z.array(z.string()).nullable().optional(),
  upgrade_target_product: z.string().nullable().optional(),
  // Campos para recorrência
  is_recurring: z.boolean().nullable().optional(),
  // Campos para upsell
  has_upsell: z.boolean().nullable().optional(),
  upsell_product: z.string().nullable().optional(),
  // Campos para downsell
  has_downsell: z.boolean().nullable().optional(),
  downsell_product: z.string().nullable().optional(),
});

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

// Componente para seleção única de produto
// Subcomponentes extraídos em ./components/ArrayInputField e ./components/ProductSelectors

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
      price: undefined,
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
      // Valores padrão para promoção
      promotion_name: "",
      promotion_description: "",
      discount_type: "percentage",
      discount_percentage: undefined,
      discount_amount: undefined,
      promotion_start_date: "",
      promotion_end_date: "",
      // Valores padrão para combo
      combo_name: "",
      combo_description: "",
      combo_products: [],
      combo_benefit: "",
      combo_discount_percentage: undefined,
      // Valores padrão para upgrade
      upgrade_name: "",
      upgrade_description: "",
      upgrade_price: undefined,
      upgrade_benefits: [],
      upgrade_target_product: "",
      // Valores padrão para recorrência
      is_recurring: false,
      // Valores padrão para upsell
      has_upsell: false,
      upsell_product: "",
      // Valores padrão para downsell
      has_downsell: false,
      downsell_product: "",


      ...initialData,
    },
  });

  const watchedValues = watch();

  type ArrayFields = keyof Pick<ProductFormData, 'benefits' | 'objections' | 'differentials' | 'success_cases'>;
  const handleArrayAdd = (field: ArrayFields, value: string) => {
    if (value.trim()) {
      const currentArray = watchedValues[field] || [];
      setValue(field, [...currentArray, value.trim()]);
    }
  };

  const handleArrayRemove = (field: ArrayFields, index: number) => {
    const currentArray = watchedValues[field] || [];
    setValue(field, currentArray.filter((_, i) => i !== index));
  };

  const renderArrayField = (field: keyof Pick<ProductFormData, 'benefits' | 'objections' | 'differentials' | 'success_cases'>, label: string, placeholder: string, icon: any) => (
    <ArrayInputField
      label={label}
            placeholder={placeholder}
      icon={icon}
      items={watchedValues[field] || []}
      onAdd={(val) => handleArrayAdd(field, val)}
      onRemove={(idx) => handleArrayRemove(field, idx)}
    />
  );

  const handleFormSubmit = async (data: ProductFormData) => {
    console.log('🔍 ProductForm handleFormSubmit called');
    console.log('📝 Form data received:', data);
    console.log('🎯 Current objections state:', objections);
    console.log('🔧 Mode:', mode);
    console.log('📋 Initial data:', initialData);
    
    try {
      // Include objections from ObjectionsManager in the form data
      // For new products, we keep the objections in the array format for backward compatibility
      // For existing products, objections are managed separately in the database
      const formDataWithObjections = {
        ...data,
        name: data.name || undefined,
        price: data.price || undefined,
        description: data.description || undefined,
        category: data.category || undefined,
        benefits: data.benefits || [],
        // Keep legacy objections field for backward compatibility, but note they're managed separately now
        objections: mode === 'edit' ? (data.objections || []) : objections.map(obj => obj.question),
        differentials: data.differentials || [],
        success_cases: data.success_cases || [],
        icon: data.icon || undefined,
        image: data.image || undefined,
        has_combo: data.has_combo ?? false,
        has_upgrade: data.has_upgrade ?? false,
        has_promotion: data.has_promotion ?? false,
        new: data.new ?? false,
        popular: data.popular ?? false,
        // Pass local objections for new products to be saved to database
        localObjections: mode === 'create' ? objections : undefined
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

  const onFormError = (errors: Record<string, { message?: string; type?: string }>) => {
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
          <BasicInfoCard register={register} errors={errors} />
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
              {renderArrayField('benefits', 'Benefícios', 'Adicione um benefício...', TrendingUp)}
              
              {renderArrayField('differentials', 'Diferenciais', 'Adicione um diferencial...', Award)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <MarketingCard
            mode={mode}
            initialProductId={(initialData as any)?.id}
            initialObjections={initialData?.objections}
            objections={objections}
            setObjections={setObjections}
            benefits={watchedValues.benefits || []}
            differentials={watchedValues.differentials || []}
            successCases={watchedValues.success_cases || []}
            onAdd={(field, val) => handleArrayAdd(field as any, val)}
            onRemove={(field, idx) => handleArrayRemove(field as any, idx)}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <ProductSettingsCard watchedValues={watchedValues} register={register} setValue={setValue} initialData={initialData} />
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