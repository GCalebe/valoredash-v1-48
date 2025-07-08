import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Eye, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWebsitesQuery,
  useCreateWebsiteMutation,
  useUpdateWebsiteMutation,
  useDeleteWebsiteMutation,
  useCrawlWebsiteMutation,
  type Website,
} from "@/hooks/useWebsitesData";

const WebsitesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewWebsite, setPreviewWebsite] = useState<Website | null>(null);
  const [newWebsite, setNewWebsite] = useState({
    url: "",
    category: "",
  });

  // Supabase hooks
  const { data: websites = [], isLoading, error } = useWebsitesQuery();
  const createWebsiteMutation = useCreateWebsiteMutation();
  const updateWebsiteMutation = useUpdateWebsiteMutation();
  const deleteWebsiteMutation = useDeleteWebsiteMutation();
  const crawlWebsiteMutation = useCrawlWebsiteMutation();

  const filteredWebsites = websites.filter(
    (website) =>
      website.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddWebsite = async () => {
    if (!newWebsite.url) {
      toast.error("Informe a URL do website.");
      return;
    }

    try {
      // Validate URL
      new URL(newWebsite.url);
    } catch {
      toast.error("URL inválida. Verifique o formato.");
      return;
    }

    try {
      const websiteData = await createWebsiteMutation.mutateAsync({
        url: newWebsite.url,
        title: `Website ${newWebsite.url}`,
        category: newWebsite.category || "Geral",
      });

      setNewWebsite({ url: "", category: "" });
      setIsAddDialogOpen(false);

      // Start crawling process
      setTimeout(() => {
        crawlWebsiteMutation.mutate(websiteData.id);
      }, 1000);
    } catch (error) {
      console.error('Error adding website:', error);
    }
  };

  const handleRefreshWebsite = (id: string) => {
    updateWebsiteMutation.mutate({
      id,
      status: 'indexing',
      last_crawled: new Date().toISOString(),
    });

    toast.success("Reindexação iniciada");

    // Start crawling process
    setTimeout(() => {
      crawlWebsiteMutation.mutate(id);
    }, 2000);
  };

  const handleDeleteWebsite = (id: string) => {
    deleteWebsiteMutation.mutate(id);
  };

  const handlePreviewWebsite = (website: Website) => {
    setPreviewWebsite(website);
    setIsPreviewDialogOpen(true);
  };

  const getStatusBadge = (status: Website["status"]) => {
    switch (status) {
      case "indexed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Indexado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        );
      case "indexing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Indexando
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Desconhecido
          </Badge>
        );
    }
  };

  // Loading skeleton component
  const WebsiteCardSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Websites</h2>
            <p className="text-muted-foreground">
              Indexe websites para expandir a base de conhecimento
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Erro ao carregar websites: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Websites
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Indexe websites para expandir a base de conhecimento
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar websites..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={createWebsiteMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {createWebsiteMutation.isPending ? "Adicionando..." : "Adicionar Website"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Website</DialogTitle>
              <DialogDescription>
                Adicione um website para indexação automática do conteúdo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  placeholder="https://exemplo.com"
                  value={newWebsite.url}
                  onChange={(e) =>
                    setNewWebsite({ ...newWebsite, url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="ex: Corporativo, Blog, Documentação..."
                  value={newWebsite.category}
                  onChange={(e) =>
                    setNewWebsite({ ...newWebsite, category: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                  onClick={handleAddWebsite}
                  disabled={createWebsiteMutation.isPending}
                >
                  {createWebsiteMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Websites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {websitesQuery.isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <WebsiteCardSkeleton key={index} />
          ))
        ) : websitesQuery.isError ? (
          // Error state
          <div className="col-span-full text-center py-12 text-red-500">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">
              Erro ao carregar websites
            </h3>
            <p className="text-sm">
              {websitesQuery.error?.message || "Ocorreu um erro inesperado."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => websitesQuery.refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : filteredWebsites.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium mb-1">
              Nenhum website encontrado
            </h3>
            <p className="text-sm">
              {searchQuery
                ? "Nenhum website corresponde à sua pesquisa."
                : "Comece adicionando websites para indexação."}
            </p>
          </div>
        ) : (
          // Websites list
          filteredWebsites.map((website) => (
            <Card
              key={website.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate">{website.title || website.url}</span>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewWebsite(website)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefreshWebsite(website.id)}
                      disabled={crawlWebsiteMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${crawlWebsiteMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebsite(website.id)}
                      className="text-red-500 hover:text-red-600"
                      disabled={deleteWebsiteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {website.description || 'Sem descrição'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(website.status)}
                    <Badge variant="outline">{website.category || 'Geral'}</Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Páginas: {website.pages_indexed || 0}</div>
                    <div>
                      Última atualização:{" "}
                      {website.last_crawled 
                        ? new Date(website.last_crawled).toLocaleDateString("pt-BR")
                        : 'Nunca'
                      }
                    </div>
                  </div>
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-600 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visitar site
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview do Website</DialogTitle>
            <DialogDescription>
              Visualização do conteúdo indexado
            </DialogDescription>
          </DialogHeader>
          {previewWebsite && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Informações do Website</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">URL:</span>
                      <div className="text-blue-500">{previewWebsite.url}</div>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <div>{getStatusBadge(previewWebsite.status)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Páginas indexadas:</span>
                      <div>{previewWebsite.pages_indexed || 0}</div>
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span>
                      <div>{previewWebsite.category}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Conteúdo Exemplo (simulado)</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Este é um exemplo de como o conteúdo indexado apareceria. O
                    sistema faria a extração automática do texto das páginas do
                    website, removendo elementos desnecessários como menus e
                    rodapés, mantendo apenas o conteúdo principal que seria útil
                    para responder perguntas dos usuários.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebsitesTab;
