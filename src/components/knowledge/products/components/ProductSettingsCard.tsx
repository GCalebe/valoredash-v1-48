// @ts-nocheck
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, Percent, Repeat, ArrowUp, ArrowDown, Tag } from "lucide-react";
import { ProductSingleSelector, ProductMultiSelector } from "../components/ProductSelectors";

interface ProductSettingsCardProps {
  watchedValues: any;
  register: any;
  setValue: (field: string, value: any) => void;
  initialData?: any;
}

const ProductSettingsCard: React.FC<ProductSettingsCardProps> = ({ watchedValues, register, setValue, initialData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Configurações do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="has_promotion" checked={watchedValues.has_promotion} onCheckedChange={(checked) => setValue("has_promotion", checked)} />
          <Label htmlFor="has_promotion">Em promoção</Label>
        </div>
        {watchedValues.has_promotion && (
          <div className="ml-6 space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h4 className="font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Configurações da Promoção
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="promotion_name">Nome da Promoção</Label>
                <Input id="promotion_name" {...register("promotion_name") } placeholder="Ex: Black Friday 2024" />
              </div>
              <div>
                <Label>Por quanto?</Label>
                <Select value={watchedValues.discount_type || "percentage"} onValueChange={(value) => setValue("discount_type", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de desconto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {watchedValues.discount_type === "percentage" ? (
                <div>
                  <Label htmlFor="discount_percentage">Desconto (%)</Label>
                  <Input id="discount_percentage" type="number" min="0" max="100" {...register("discount_percentage", { valueAsNumber: true })} placeholder="Ex: 25" />
                </div>
              ) : (
                <div>
                  <Label htmlFor="discount_amount">Valor do Desconto (R$)</Label>
                  <Input id="discount_amount" type="number" min="0" step="0.01" {...register("discount_amount", { valueAsNumber: true })} placeholder="Ex: 50.00" />
                </div>
              )}
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded border">
                  {watchedValues.discount_type === "percentage" ? "💡 Desconto será calculado como porcentagem do preço" : "💡 Desconto será um valor fixo em reais"}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="promotion_description">Descrição da Promoção</Label>
              <Textarea id="promotion_description" {...register("promotion_description")} placeholder="Descreva os detalhes da promoção..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="promotion_start_date">Data de Início</Label>
                <Input id="promotion_start_date" type="datetime-local" {...register("promotion_start_date")} />
              </div>
              <div>
                <Label htmlFor="promotion_end_date">Data de Fim</Label>
                <Input id="promotion_end_date" type="datetime-local" {...register("promotion_end_date")} />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="has_combo" checked={watchedValues.has_combo} onCheckedChange={(checked) => setValue("has_combo", checked)} />
          <Label htmlFor="has_combo">Oferece combo</Label>
        </div>
        {watchedValues.has_combo && (
          <div className="ml-6 space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Configurações do Combo
            </h4>
            <div>
              <Label htmlFor="combo_name">Qual seria o combo?</Label>
              <Input id="combo_name" {...register("combo_name")} placeholder="Ex: Pacote Completo, Kit Iniciante, Bundle Premium" />
            </div>
            <div>
              <Label>Com quais produtos?</Label>
              <ProductMultiSelector selectedProducts={watchedValues.combo_products || []} onSelectionChange={(products) => setValue("combo_products", products)} placeholder="Selecione os produtos do combo..." excludeCurrentProduct={initialData?.id} />
            </div>
            <div>
              <Label htmlFor="combo_benefit">O que o cliente ganha?</Label>
              <Textarea id="combo_benefit" {...register("combo_benefit")} placeholder="Descreva os benefícios e vantagens do combo\nEx: Economia de 30%, acesso a conteúdo exclusivo, suporte prioritário" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="combo_discount_percentage">Desconto do Combo (%)</Label>
                <Input id="combo_discount_percentage" type="number" min="0" max="100" {...register("combo_discount_percentage", { valueAsNumber: true })} placeholder="Ex: 15" />
              </div>
            </div>
            <div>
              <Label htmlFor="combo_description">Descrição do Combo</Label>
              <Textarea id="combo_description" {...register("combo_description")} placeholder="Descreva o que está incluído no combo..." rows={2} />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="has_upgrade" checked={watchedValues.has_upgrade} onCheckedChange={(checked) => setValue("has_upgrade", checked)} />
          <Label htmlFor="has_upgrade">Oferece upgrade</Label>
        </div>
        {watchedValues.has_upgrade && (
          <div className="ml-6 space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200">Configurações do Upgrade</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="upgrade_name">Nome do Upgrade</Label>
                <Input id="upgrade_name" {...register("upgrade_name")} placeholder="Ex: Versão Premium" />
              </div>
              <div>
                <Label htmlFor="upgrade_price">Preço do Upgrade (R$)</Label>
                <Input id="upgrade_price" type="number" min="0" step="0.01" {...register("upgrade_price", { valueAsNumber: true })} placeholder="Ex: 199.90" />
              </div>
            </div>
            <div>
              <Label htmlFor="upgrade_description">Descrição do Upgrade</Label>
              <Textarea id="upgrade_description" {...register("upgrade_description")} placeholder="Descreva os benefícios do upgrade..." rows={2} />
            </div>
            <div>
              <Label>Produto de Destino</Label>
              <ProductSingleSelector selectedProduct={watchedValues.upgrade_target_product || ""} onSelectionChange={(productId) => setValue("upgrade_target_product", productId)} placeholder="Selecione o produto de upgrade..." excludeCurrentProduct={initialData?.id} />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="is_recurring" checked={watchedValues.is_recurring} onCheckedChange={(checked) => setValue("is_recurring", checked)} />
          <Label htmlFor="is_recurring" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Se o cliente adquirir este produto, ele pode comprar de novo depois?
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="has_upsell" checked={watchedValues.has_upsell} onCheckedChange={(checked) => setValue("has_upsell", checked)} />
          <Label htmlFor="has_upsell" className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4" />
            Se o cliente adquirir este produto, há algum Upsell imediato?
          </Label>
        </div>
        {watchedValues.has_upsell && (
          <div className="ml-6 space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Configurações do Upsell
            </h4>
            <div>
              <Label>Com qual produto?</Label>
              <ProductSingleSelector selectedProduct={watchedValues.upsell_product || ""} onSelectionChange={(productId) => setValue("upsell_product", productId)} placeholder="Selecione o produto para upsell..." excludeCurrentProduct={initialData?.id} />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="has_downsell" checked={watchedValues.has_downsell} onCheckedChange={(checked) => setValue("has_downsell", checked)} />
          <Label htmlFor="has_downsell" className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            Se o cliente não adquirir este produto, há algum Downsell imediato?
          </Label>
        </div>
        {watchedValues.has_downsell && (
          <div className="ml-6 space-y-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Configurações do Downsell
            </h4>
            <div>
              <Label>Produto alternativo para oferecer</Label>
              <ProductSingleSelector selectedProduct={watchedValues.downsell_product || ""} onSelectionChange={(productId) => setValue("downsell_product", productId)} placeholder="Selecione o produto para downsell..." excludeCurrentProduct={initialData?.id} />
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded border">💡 Este produto será oferecido imediatamente se o cliente recusar a compra principal</div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="new" checked={watchedValues.new} onCheckedChange={(checked) => setValue("new", checked)} />
          <Label htmlFor="new">Produto novo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="popular" checked={watchedValues.popular} onCheckedChange={(checked) => setValue("popular", checked)} />
          <Label htmlFor="popular">Produto popular</Label>
        </div>
        <div>
          <Label htmlFor="icon">Ícone (URL)</Label>
          <Input id="icon" {...register("icon")} placeholder="https://exemplo.com/icone.png" />
        </div>
        <div>
          <Label htmlFor="image">Imagem (URL)</Label>
          <Input id="image" {...register("image")} placeholder="https://exemplo.com/imagem.jpg" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSettingsCard;


