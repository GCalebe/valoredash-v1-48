// @ts-nocheck
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Building, Settings } from "lucide-react";
import BasicInfoFields from "@/components/clients/BasicInfoFields";
import CompanyInfoFields from "@/components/clients/CompanyInfoFields";
import AddClientCustomFields from "@/components/clients/AddClientCustomFields";
import ClientUTMData from "@/components/clients/ClientUTMData";
import ClientFilesTab from "@/components/clients/ClientFilesTab";
import ClientProductsTab from "@/components/clients/ClientProductsTab";
import { Contact } from "@/types/client";
import { useCustomFields } from "@/hooks/useCustomFields";

type PrincipalLevel = "basic" | "company" | "custom";

interface ModernContactTabsProps {
  contactId: string;
  contact: Contact;
  onFieldUpdate?: (field: keyof Contact, value: any) => void;
}

const ModernContactTabs = ({ contactId, contact, onFieldUpdate }: ModernContactTabsProps) => {
  const [principalLevel, setPrincipalLevel] = useState<PrincipalLevel>("basic");
  const { customFields, loading: customFieldsLoading } = useCustomFields();
  const [customValues, setCustomValues] = useState<{ [fieldId: string]: string | string[] | null }>({});

  const principalLevelConfig = {
    basic: {
      label: "Informações Básicas",
      icon: User,
      description: "Nome, email, telefone, endereço",
    },
    company: {
      label: "Informações da Empresa",
      icon: Building,
      description: "Empresa, tipo, tamanho, CPF/CNPJ",
    },
    custom: {
      label: "Campos Personalizados",
      icon: Settings,
      description: "Campos customizados",
    },
  };

  const handleInputChange = (field: keyof Contact, value: any) => {
    onFieldUpdate?.(field, value);
  };

  const handleCustomFieldChange = (fieldId: string, value: string | string[] | null) => {
    setCustomValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Convert contact to format expected by BasicInfoFields and CompanyInfoFields
  const contactData: Partial<Contact> = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    clientName: contact.clientName,
    clientType: contact.clientType,
    clientSize: contact.clientSize,
    cpfCnpj: contact.cpfCnpj,
    notes: contact.notes,
    responsibleHosts: contact.responsibleHosts,
  };

  const renderPrincipalContent = () => {
    switch (principalLevel) {
      case "basic":
        return (
          <BasicInfoFields
            newContact={contactData}
            validationErrors={{}}
            onInputChange={handleInputChange}
          />
        );
      case "company":
        return (
          <CompanyInfoFields
            newContact={contactData}
            validationErrors={{}}
            onInputChange={handleInputChange}
          />
        );
      case "custom":
        return (
          <AddClientCustomFields
            customFields={customFields}
            customValues={customValues}
            onCustomFieldChange={handleCustomFieldChange}
            loading={customFieldsLoading}
          />
        );
      default:
        return null;
    }
  };

  const CurrentIcon = principalLevelConfig[principalLevel].icon;

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="principal" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="principal" className="text-xs">Principal</TabsTrigger>
          <TabsTrigger value="utm" className="text-xs">UTM</TabsTrigger>
          <TabsTrigger value="midia" className="text-xs">Mídia</TabsTrigger>
          <TabsTrigger value="produtos" className="text-xs">Produtos</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="principal" className="h-full m-0">
            <div className="space-y-4 h-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-background border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <CurrentIcon className="h-4 w-4" />
                      <span className="text-sm">{principalLevelConfig[principalLevel].label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-background border-border shadow-md">
                  {Object.entries(principalLevelConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setPrincipalLevel(key as PrincipalLevel)}
                        className="flex flex-col items-start gap-1 p-3 hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="p-4 space-y-4">
                  {renderPrincipalContent()}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="utm" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {contactId ? (
                  <ClientUTMData contactId={contactId} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <h3 className="text-lg font-medium mb-2">Dados UTM</h3>
                    <p>Os dados UTM estarão disponíveis após salvar o contato.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="midia" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {contactId ? (
                  <ClientFilesTab 
                    clientId={contactId} 
                    onFileUpdate={(files) => {
                      console.log('Files updated:', files);
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <h3 className="text-lg font-medium mb-2">Mídia</h3>
                    <p>Os arquivos de mídia estarão disponíveis após salvar o contato.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="produtos" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {contactId ? (
                  <ClientProductsTab clientId={contactId} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <h3 className="text-lg font-medium mb-2">Produtos de Interesse</h3>
                    <p>Os produtos de interesse estarão disponíveis após salvar o contato.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ModernContactTabs;