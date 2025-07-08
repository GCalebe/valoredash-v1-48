import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFormData, ProductCombo } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<ProductCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) {
        throw productsError;
      }

      // Fetch combos with their products
      const { data: combosData, error: combosError } = await supabase
        .from("product_combos")
        .select(`
          *,
          products:product_combo_items(
            product:products(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (combosError) {
        throw combosError;
      }

      // Format combo data
      const formattedCombos = combosData.map((combo: any) => {
        return {
          ...combo,
          products: combo.products.map((item: any) => item.product)
        };
      });

      setProducts(productsData);
      setCombos(formattedCombos);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshProducts = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData: ProductFormData): Promise<string | undefined> => {
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso.",
      });

      // Refresh the products list
      refreshProducts();
      
      return data.id;
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [user, toast, refreshProducts]);

  const updateProduct = useCallback(async (id: string, productData: Partial<ProductFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });

      // Refresh the products list
      refreshProducts();
      
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, refreshProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      // Refresh the products list
      refreshProducts();
      
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, refreshProducts]);

  const addCombo = useCallback(async (
    name: string, 
    description: string | undefined, 
    discountPercentage: number | undefined,
    productIds: string[]
  ): Promise<string | undefined> => {
    try {
      // First create the combo
      const { data: comboData, error: comboError } = await supabase
        .from("product_combos")
        .insert({
          name,
          description,
          discount_percentage: discountPercentage
        })
        .select()
        .single();

      if (comboError) {
        throw comboError;
      }

      // Then add the products to the combo
      const comboItems = productIds.map(productId => ({
        combo_id: comboData.id,
        product_id: productId
      }));

      const { error: itemsError } = await supabase
        .from("product_combo_items")
        .insert(comboItems);

      if (itemsError) {
        throw itemsError;
      }

      toast({
        title: "Combo adicionado",
        description: "O combo foi adicionado com sucesso.",
      });

      // Refresh the products list
      refreshProducts();
      
      return comboData.id;
    } catch (error) {
      console.error("Error adding combo:", error);
      toast({
        title: "Erro ao adicionar combo",
        description: "Não foi possível adicionar o combo. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [toast, refreshProducts]);

  const deleteCombo = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Delete the combo (cascade will delete the items)
      const { error } = await supabase
        .from("product_combos")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Combo excluído",
        description: "O combo foi excluído com sucesso.",
      });

      // Refresh the products list
      refreshProducts();
      
      return true;
    } catch (error) {
      console.error("Error deleting combo:", error);
      toast({
        title: "Erro ao excluir combo",
        description: "Não foi possível excluir o combo. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, refreshProducts]);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch products for a specific client
  const fetchClientProducts = async (clientId: string) => {
    try {
      setLoading(true);
      
      // Get products associated with this client
      const { data: clientProductsData, error: clientProductsError } = await supabase
        .from("client_products")
        .select("product_id")
        .eq("client_id", clientId);

      if (clientProductsError) throw clientProductsError;

      // Get all products
      const { data: allProducts, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (productsError) throw productsError;

      // Filter client products
      const clientProductIds = clientProductsData.map(item => item.product_id);
      const clientProducts = allProducts.filter(product => 
        clientProductIds.includes(product.id)
      );

      // Filter available products (those not already associated with the client)
      const availableProducts = allProducts.filter(product => 
        !clientProductIds.includes(product.id)
      );

      return { clientProducts, availableProducts };
    } catch (error) {
      console.error("Error fetching client products:", error);
      toast({
        title: "Erro ao carregar produtos do cliente",
        description: "Não foi possível carregar os produtos do cliente. Tente novamente.",
        variant: "destructive",
      });
      return { clientProducts: [], availableProducts: [] };
    } finally {
      setLoading(false);
    }
  };

  // Add a product to a client
  const addProductToClient = async (clientId: string, productId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("client_products")
        .insert([
          { client_id: clientId, product_id: productId }
        ]);

      if (error) throw error;
      
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado ao cliente com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding product to client:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto ao cliente. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove a product from a client
  const removeProductFromClient = async (clientId: string, productId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("client_products")
        .delete()
        .eq("client_id", clientId)
        .eq("product_id", productId);

      if (error) throw error;
      
      toast({
        title: "Produto removido",
        description: "O produto foi removido do cliente com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing product from client:", error);
      toast({
        title: "Erro ao remover produto",
        description: "Não foi possível remover o produto do cliente. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    combos,
    loading,
    refreshing,
    fetchProducts,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addCombo,
    deleteCombo,
    fetchClientProducts,
    addProductToClient,
    removeProductFromClient
  };
}

// Mutation hooks for React Query integration
export function useCreateProductMutation() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: ProductFormData) => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error("Error adding product:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Não foi possível adicionar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

export function useUpdateProductMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }: { id: string; productData: Partial<ProductFormData> }) => {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id);

      if (error) {
        throw error;
      }

      return { id, productData };
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}

export function useDeleteProductMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });
}