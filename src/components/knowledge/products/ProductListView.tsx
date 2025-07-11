import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  DollarSign,
  Package,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
  benefits?: string[];
  objections?: string[];
  differentials?: string[];
  success_cases?: string[];
  has_combo?: boolean;
  has_upgrade?: boolean;
  has_promotion?: boolean;
  created_at?: string;
}

interface ProductListViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const ProductListView: React.FC<ProductListViewProps> = ({ 
  products, 
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getFeatureCount = (product: Product) => {
    const counts = [
      product.benefits?.length || 0,
      product.objections?.length || 0,
      product.differentials?.length || 0,
      product.success_cases?.length || 0,
    ];
    const total = counts.reduce((sum, count) => sum + count, 0);
    return total;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Características</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="w-[70px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium line-clamp-1">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {product.description}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatPrice(product.price)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span>{getFeatureCount(product)} itens</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {product.has_promotion && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Promoção
                    </Badge>
                  )}
                  {product.has_combo && (
                    <Badge variant="secondary" className="text-xs">
                      Combo
                    </Badge>
                  )}
                  {product.has_upgrade && (
                    <Badge variant="outline" className="text-xs">
                      Upgrade
                    </Badge>
                  )}
                  {!product.has_promotion && !product.has_combo && !product.has_upgrade && (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(product.created_at)}
                </span>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
};

export default ProductListView;