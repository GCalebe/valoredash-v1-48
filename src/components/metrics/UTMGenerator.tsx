import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Link, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UTMConfig {
  id: string;
  friendlyName: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  baseUrl: string;
  generatedUrl: string;
  createdAt: Date;
  createdBy: string;
}

const UTMGenerator = () => {
  const { toast } = useToast();
  const [currentConfig, setCurrentConfig] = useState<
    Omit<UTMConfig, "id" | "generatedUrl" | "createdAt" | "createdBy">
  >({
    friendlyName: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    baseUrl: "https://seusite.com",
  });
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [history, setHistory] = useState<UTMConfig[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateUTMLink = () => {
    if (
      !currentConfig.utm_source ||
      !currentConfig.utm_medium ||
      !currentConfig.utm_campaign
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha pelo menos Source, Medium e Campaign",
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams();
    if (currentConfig.utm_source)
      params.append("utm_source", currentConfig.utm_source);
    if (currentConfig.utm_medium)
      params.append("utm_medium", currentConfig.utm_medium);
    if (currentConfig.utm_campaign)
      params.append("utm_campaign", currentConfig.utm_campaign);
    if (currentConfig.utm_content)
      params.append("utm_content", currentConfig.utm_content);
    if (currentConfig.utm_term)
      params.append("utm_term", currentConfig.utm_term);

    const finalUrl = `${currentConfig.baseUrl}?${params.toString()}`;
    setGeneratedUrl(finalUrl);

    // Adicionar ao histórico
    const newConfig: UTMConfig = {
      ...currentConfig,
      id: Date.now().toString(),
      generatedUrl: finalUrl,
      createdAt: new Date(),
      createdBy: "Usuário Atual", // Implementar sistema de usuário
    };

    setHistory((prev) => [newConfig, ...prev]);

    toast({
      title: "Link UTM gerado!",
      description: "URL criada com sucesso",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const clearForm = () => {
    setCurrentConfig({
      friendlyName: "",
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
      baseUrl: "https://seusite.com",
    });
    setGeneratedUrl("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Gerador e Configurador de UTMs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="friendlyName">Nome Amigável</Label>
              <Input
                id="friendlyName"
                placeholder="Ex: Campanha Black Friday 2024"
                value={currentConfig.friendlyName}
                onChange={(e) =>
                  handleInputChange("friendlyName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">URL Base</Label>
              <Input
                id="baseUrl"
                placeholder="https://seusite.com"
                value={currentConfig.baseUrl}
                onChange={(e) => handleInputChange("baseUrl", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utm_source">UTM Source *</Label>
              <Input
                id="utm_source"
                placeholder="Ex: google, facebook, email"
                value={currentConfig.utm_source}
                onChange={(e) =>
                  handleInputChange("utm_source", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_medium">UTM Medium *</Label>
              <Input
                id="utm_medium"
                placeholder="Ex: cpc, email, social"
                value={currentConfig.utm_medium}
                onChange={(e) =>
                  handleInputChange("utm_medium", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_campaign">UTM Campaign *</Label>
              <Input
                id="utm_campaign"
                placeholder="Ex: black_friday_2024"
                value={currentConfig.utm_campaign}
                onChange={(e) =>
                  handleInputChange("utm_campaign", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utm_content">UTM Content</Label>
              <Input
                id="utm_content"
                placeholder="Ex: banner_top, link_rodape"
                value={currentConfig.utm_content}
                onChange={(e) =>
                  handleInputChange("utm_content", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_term">UTM Term</Label>
              <Input
                id="utm_term"
                placeholder="Ex: marketing_digital"
                value={currentConfig.utm_term}
                onChange={(e) => handleInputChange("utm_term", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateUTMLink}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              🔗 Gerar Link UTM
            </Button>
            <Button variant="outline" onClick={clearForm}>
              Limpar
            </Button>
          </div>

          {generatedUrl && (
            <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Label>URL Gerada:</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedUrl}
                  readOnly
                  className="bg-white dark:bg-gray-800"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generatedUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Links Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {history.map((config) => (
                <div
                  key={config.id}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {config.friendlyName || "Link UTM"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {config.utm_source} / {config.utm_medium} /{" "}
                        {config.utm_campaign}
                      </p>
                      <p className="text-xs text-gray-400">
                        Criado em {config.createdAt.toLocaleDateString("pt-BR")}{" "}
                        às {config.createdAt.toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(config.generatedUrl)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono break-all">
                    {config.generatedUrl}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UTMGenerator;
