import React, { useState } from "react";
import {
  Plus,
  Search,
  Globe,
  ExternalLink,
  Trash2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Website {
  id: number;
  url: string;
  title: string;
  description: string;
  status: "active" | "pending" | "error";
  lastCrawled: string;
  pagesIndexed: number;
  category: string;
}

const WebsitesTab = () => {
  const { toast } = useToast();

  const PremiumOverlay = () => (
    <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
      <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transform -rotate-12">
        <span className="text-xl font-bold">Conteúdo Premium</span>
      </div>
    </div>
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewWebsite, setPreviewWebsite] = useState<Website | null>(null);
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: 1,
      url: "https://exemplo.com",
      title: "Site Principal da Empresa",
      description: "Site corporativo com informações sobre serviços",
      status: "active",
      lastCrawled: "2024-01-15T10:30:00",
      pagesIndexed: 25,
      category: "Corporativo",
    },
    {
      id: 2,
      url: "https://blog.exemplo.com",
      title: "Blog da Empresa",
      description: "Artigos e dicas sobre o setor",
      status: "pending",
      lastCrawled: "2024-01-10T14:20:00",
      pagesIndexed: 12,
      category: "Blog",
    },
  ]);

  const [newWebsite, setNewWebsite] = useState({
    url: "",
    category: "",
  });

  const filteredWebsites = websites.filter(
    (website) =>
      website.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddWebsite = async () => {
    if (!newWebsite.url) {
      toast({
        title: "URL obrigatória",
        description: "Informe a URL do website.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(newWebsite.url);
    } catch {
      toast({
        title: "URL inválida",
        description: "Informe uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    const website: Website = {
      id: Date.now(),
      url: newWebsite.url,
      title: `Website - ${newWebsite.url}`,
      description: "Aguardando indexação...",
      status: "pending",
      lastCrawled: new Date().toISOString(),
      pagesIndexed: 0,
      category: newWebsite.category || "Geral",
    };

    setWebsites([...websites, website]);
    setNewWebsite({ url: "", category: "" });
    setIsAddDialogOpen(false);

    toast({
      title: "Website adicionado",
      description: "Website adicionado para indexação!",
    });

    // Simulate crawling process
    setTimeout(() => {
      setWebsites((prev) =>
        prev.map((w) =>
          w.id === website.id
            ? {
                ...w,
                status: "active" as const,
                title: `Site ${w.url}`,
                description: "Conteúdo indexado com sucesso",
                pagesIndexed: Math.floor(Math.random() * 50) + 5,
              }
            : w,
        ),
      );
    }, 3000);
  };

  const handleRefreshWebsite = (id: number) => {
    setWebsites((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status: "pending" as const,
              lastCrawled: new Date().toISOString(),
            }
          : w,
      ),
    );

    toast({
      title: "Reindexação iniciada",
      description: "O website será reindexado em breve.",
    });

    // Simulate reindexing
    setTimeout(() => {
      setWebsites((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                status: "active" as const,
                pagesIndexed: Math.floor(Math.random() * 50) + 5,
              }
            : w,
        ),
      );
    }, 2000);
  };

  const handleDeleteWebsite = (id: number) => {
    setWebsites(websites.filter((w) => w.id !== id));
    toast({
      title: "Website removido",
      description: "Website removido da base de conhecimento!",
      variant: "destructive",
    });
  };

  const handlePreviewWebsite = (website: Website) => {
    setPreviewWebsite(website);
    setIsPreviewDialogOpen(true);
  };

  const getStatusBadge = (status: Website["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Ativo
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Processando
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Erro
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 relative">
      <PremiumOverlay />
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Website
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
              <Button onClick={handleAddWebsite}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Websites List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWebsites.length === 0 ? (
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
          filteredWebsites.map((website) => (
            <Card
              key={website.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="truncate">{website.title}</span>
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
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWebsite(website.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {website.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(website.status)}
                    <Badge variant="outline">{website.category}</Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Páginas: {website.pagesIndexed}</div>
                    <div>
                      Última atualização:{" "}
                      {new Date(website.lastCrawled).toLocaleDateString(
                        "pt-BR",
                      )}
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
                      <div>{previewWebsite.pagesIndexed}</div>
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
