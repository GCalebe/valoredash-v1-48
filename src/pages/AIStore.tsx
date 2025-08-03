import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import {
  ArrowLeft,
  LogOut,
  Star,
  Sparkles,
  ShipWheel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AIProductPriceTag from "@/components/AIProductPriceTag";
import { useAIProductsQuery } from "@/hooks/useAIProductsQuery";

// Define AIProduct interface locally to avoid mock dependency
interface AIProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  features: string[];
  image: string;
  icon: string;
  popular: boolean;
  new: boolean;
  rating: number;
  reviews: number;
}

const AIStore = () => {
  const { user, signOut } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  const { data: products = [], isLoading: queryLoading } = useAIProductsQuery();

  const [filteredProducts, setFilteredProducts] = useState<AIProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transform products when data changes
  useEffect(() => {
    setIsLoading(queryLoading);
    if (products && products.length > 0) {
      // Transform Supabase products to AIProduct format
      const transformedProducts: AIProduct[] = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        category: product.category || 'Geral',
        price: product.price || 0,
        currency: 'BRL',
        features: product.features || [],
        image: product.image_url || '/lovable-uploads/7a96682a-47a3-4ed0-8036-8a31ad28cb4b.png',
        icon: product.icon_name || 'Bot',
        popular: product.popular || false,
        new: product.is_new || false,
        rating: product.rating || 4.5,
        reviews: product.reviews_count || 0
      }));
      setFilteredProducts(transformedProducts);
    } else {
      setFilteredProducts([]);
    }
  }, [products, queryLoading]);

  const handleSelectAI = (productId: string) => {
    // Navigate to the Knowledge Manager with the selected AI
    navigate(`/knowledge?aiProduct=${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header
        className="text-white shadow-md transition-colors duration-300 rounded-b-xl"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="flex flex-row items-center justify-between min-h-[64px] w-full px-6 py-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 focus-visible:ring-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <ShipWheel
                className="h-8 w-8"
                style={{ color: settings.secondaryColor }}
              />
            )}
            <h1 className="text-2xl font-bold">{settings.brandName}</h1>
            <span className="text-lg ml-2">- Loja de IAs</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="border-white text-white bg-transparent hover:bg-white/20"
            >
              Ver Planos
            </Button>
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-0 px-3 py-1"
            >
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-white text-white bg-transparent hover:bg-white/20"
              style={{ height: 40, borderRadius: 8, borderWidth: 1.4 }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Loja de Inteligências Artificiais
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha entre diversas IAs pré-configuradas para diferentes necessidades
          </p>
        </div>

        {/* Featured Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              IAs em Destaque
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts
                .filter((product) => product.popular)
                .map((product) => (
                  <AIProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectAI}
                  />
                ))}
            </div>
          )}
        </div>

        {/* New Arrivals */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Novidades
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts
                .filter((product) => product.new)
                .map((product) => (
                  <AIProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelectAI}
                  />
                ))}
            </div>
          )}
        </div>

        {/* All Products */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShipWheel className="h-5 w-5 text-gray-800 dark:text-gray-100" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Todas as IAs
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
                  <CardHeader className="pb-2">
                    <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Nenhuma IA encontrada
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Tente ajustar seus filtros ou termos de busca
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <AIProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectAI}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface AIProductCardProps {
  product: AIProduct;
  onSelect: (productId: string) => void;
}

const AIProductCard: React.FC<AIProductCardProps> = ({ product, onSelect }) => {
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {product.popular && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 text-white">Popular</Badge>
          </div>
        )}
        {product.new && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-blue-500 text-white">Novo</Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <Badge variant="outline" className="bg-white/20 text-white border-0">
            {product.category}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-lg">{product.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recursos:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{feature}</span>
              </li>
            ))}
            {product.features.length > 3 && (
              <li className="text-xs text-gray-500 dark:text-gray-500">
                +{product.features.length - 3} recursos adicionais
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <AIProductPriceTag product={product} />
      </CardFooter>
    </Card>
  );
};

export default AIStore;