import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { Button } from "@/components/ui/button";
import { ShipWheel, LogOut, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all tab components
import ProductsTab from "@/components/knowledge/tabs/ProductsTab";
import FAQTab from "@/components/knowledge/tabs/FAQTab";
import WebsitesTab from "@/components/knowledge/tabs/WebsitesTab";
import AIPersonalityTab from "@/components/knowledge/tabs/AIPersonalityTab";
import AIStagesTab from "@/components/knowledge/tabs/AIStagesTab";
import AIMessagesTab from "@/components/knowledge/tabs/AIMessagesTab";
import AITestTab from "@/components/knowledge/tabs/AITestTab";

const KnowledgeManager = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { settings } = useThemeSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("documents");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div
          className="h-16 w-16 border-4 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: `${settings.secondaryColor} transparent ${settings.secondaryColor} ${settings.secondaryColor}`,
          }}
        ></div>
      </div>
    );
  }

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
            <span className="text-lg ml-2">- Conhecimento</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-0 px-3 py-1"
            >
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciador de Conhecimento
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie produtos, FAQ, websites e configurações da IA
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7 bg-gray-100 dark:bg-gray-700 p-1 rounded-t-lg">
              <TabsTrigger value="documents" className="text-sm">
                Produtos
              </TabsTrigger>
              <TabsTrigger value="faq" className="text-sm">
                FAQ
              </TabsTrigger>
              <TabsTrigger value="websites" className="text-sm">
                Websites
              </TabsTrigger>
              <TabsTrigger value="ai-personality" className="text-sm">
                Personalidade
              </TabsTrigger>
              <TabsTrigger value="ai-stages" className="text-sm">
                Etapas
              </TabsTrigger>
              <TabsTrigger value="ai-messages" className="text-sm">
                Mensagens
              </TabsTrigger>
              <TabsTrigger value="ai-test" className="text-sm">
                Teste
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="documents" className="mt-0">
                <ProductsTab />
              </TabsContent>

              <TabsContent value="faq" className="mt-0">
                <FAQTab />
              </TabsContent>

              <TabsContent value="websites" className="mt-0">
                <WebsitesTab />
              </TabsContent>

              <TabsContent value="ai-personality" className="mt-0">
                <AIPersonalityTab />
              </TabsContent>

              <TabsContent value="ai-stages" className="mt-0">
                <AIStagesTab />
              </TabsContent>

              <TabsContent value="ai-messages" className="mt-0">
                <AIMessagesTab />
              </TabsContent>

              <TabsContent value="ai-test" className="mt-0">
                <AITestTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeManager;
