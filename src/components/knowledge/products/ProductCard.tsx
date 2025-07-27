import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Edit, 
  Trash2, 
  Package,
  TrendingUp,
  Award,
  Tag,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  isDeleting 
}) => {
  const formatPrice = (price?: number) => {
    if (!price) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getBadgeCount = (items?: string[]) => items?.length || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {product.name}
            </CardTitle>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(product.id)}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Features/Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {getBadgeCount(product.benefits) > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{getBadgeCount(product.benefits)} benefícios</span>
            </div>
          )}
          
          {getBadgeCount(product.differentials) > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Award className="h-3 w-3" />
              <span>{getBadgeCount(product.differentials)} diferenciais</span>
            </div>
          )}
          
          {getBadgeCount(product.objections) > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{getBadgeCount(product.objections)} objeções</span>
            </div>
          )}
          
          {getBadgeCount(product.success_cases) > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>{getBadgeCount(product.success_cases)} casos</span>
            </div>
          )}
          

        </div>

        {/* Category */}
        {product.category && (
          <div className="text-sm text-muted-foreground">
            <Tag className="h-3 w-3 inline mr-1" />
            {product.category}
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {product.new && (
            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Novo
            </Badge>
          )}
          
          {product.popular && (
            <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              Popular
            </Badge>
          )}
          
          {product.has_promotion && (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Em Promoção
            </Badge>
          )}
          
          {product.has_combo && (
            <Badge variant="secondary">
              Combo
            </Badge>
          )}
          
          {product.has_upgrade && (
            <Badge variant="outline">
              Upgrade
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(product.id)}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;