import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UTMGenerator from "./UTMGenerator";

interface UTMConfigPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UTMConfigPanel: React.FC<UTMConfigPanelProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const shareToWhatsApp = (url: string) => {
    const message = `Confira este link: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareToSocial = (url: string, platform: string) => {
    let shareUrl = "";
    const text = "Confira este link interessante!";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url,
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text,
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url,
        )}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar UTMs
          </SheetTitle>
          <SheetDescription>
            Crie e gerencie seus links UTM para campanhas de marketing
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator">Gerador</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="share">Compartilhar</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="mt-4">
              <UTMGenerator />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="text-center py-8 text-gray-500">
                <p>
                  O histórico será integrado com o componente principal do
                  gerador
                </p>
              </div>
            </TabsContent>

            <TabsContent value="share" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Opções de Compartilhamento
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => shareToWhatsApp("https://exemplo.com")}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      shareToSocial("https://exemplo.com", "facebook")
                    }
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      shareToSocial("https://exemplo.com", "twitter")
                    }
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      shareToSocial("https://exemplo.com", "linkedin")
                    }
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UTMConfigPanel;
