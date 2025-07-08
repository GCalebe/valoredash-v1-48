import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  RotateCcw,
  Palette,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const ThemeSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings, resetSettings } = useThemeSettings();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter menos de 2MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateSettings({ logo: result });
        toast({
          title: "Logo atualizada",
          description: "A logo foi carregada com sucesso!",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    resetSettings();
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas para o padrão.",
    });
  };

  const handleThemeChange = (value: string) => {
    if (
      value &&
      (value === "light" || value === "dark" || value === "system")
    ) {
      setTheme(value);
      toast({
        title: "Tema alterado",
        description: `Tema alterado para ${
          value === "light" ? "claro" : value === "dark" ? "escuro" : "sistema"
        }.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-petshop-blue dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Configurações de Tema
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configurações */}
          <div className="space-y-6">
            {/* Modo de Tema */}
            <Card>
              <CardHeader>
                <CardTitle>Modo de Tema</CardTitle>
                <CardDescription>
                  Escolha entre tema claro, escuro ou seguir as configurações do
                  sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Selecione o modo de tema</Label>
                  <ToggleGroup
                    type="single"
                    value={theme}
                    onValueChange={handleThemeChange}
                    className="grid grid-cols-3 gap-2"
                  >
                    <ToggleGroupItem
                      value="light"
                      aria-label="Tema claro"
                      className="flex flex-col items-center gap-2 p-4"
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-sm">Claro</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="dark"
                      aria-label="Tema escuro"
                      className="flex flex-col items-center gap-2 p-4"
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-sm">Escuro</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="system"
                      aria-label="Sistema"
                      className="flex flex-col items-center gap-2 p-4"
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Sistema</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    O modo sistema segue as configurações de tema do seu
                    dispositivo
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nome da Marca */}
            <Card>
              <CardHeader>
                <CardTitle>Nome da Marca</CardTitle>
                <CardDescription>
                  Personalize o nome que aparece no cabeçalho do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="brandName">Nome da Marca</Label>
                  <Input
                    id="brandName"
                    value={settings.brandName}
                    onChange={(e) =>
                      updateSettings({ brandName: e.target.value })
                    }
                    placeholder="Digite o nome da sua marca"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>
                  Faça upload da logo da sua marca (máximo 2MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Fazer Upload
                    </Button>
                    {settings.logo && (
                      <Button
                        variant="ghost"
                        onClick={() => updateSettings({ logo: null })}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover Logo
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {settings.logo && (
                    <div className="flex items-center gap-2">
                      <img
                        src={settings.logo}
                        alt="Logo preview"
                        className="h-12 w-12 object-contain rounded border"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Logo carregada
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cores */}
            <Card>
              <CardHeader>
                <CardTitle>Cores do Tema</CardTitle>
                <CardDescription>
                  Personalize as cores principais do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) =>
                          updateSettings({ primaryColor: e.target.value })
                        }
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) =>
                          updateSettings({ primaryColor: e.target.value })
                        }
                        placeholder="#1a365d"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) =>
                          updateSettings({ secondaryColor: e.target.value })
                        }
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) =>
                          updateSettings({ secondaryColor: e.target.value })
                        }
                        placeholder="#fbbf24"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Cor de Destaque</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) =>
                          updateSettings({ accentColor: e.target.value })
                        }
                        className="w-12 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={settings.accentColor}
                        onChange={(e) =>
                          updateSettings({ accentColor: e.target.value })
                        }
                        placeholder="#172554"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar Configurações
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Visualize como ficará o cabeçalho com suas configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="px-4 py-4 text-white"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {settings.logo ? (
                          <img
                            src={settings.logo}
                            alt="Logo"
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded"
                            style={{ backgroundColor: settings.secondaryColor }}
                          />
                        )}
                        <h1 className="text-xl font-bold">
                          {settings.brandName}
                        </h1>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="px-3 py-1 rounded text-sm"
                          style={{
                            backgroundColor: `${settings.accentColor}88`,
                          }}
                        >
                          Preview
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThemeSettings;
