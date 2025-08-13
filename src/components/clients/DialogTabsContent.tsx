// @ts-nocheck
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import ClientUTMData from "./ClientUTMData";
import ClientFilesTab from "./ClientFilesTab";
import ClientProductsTab from "./ClientProductsTab";
import { Contact } from "@/types/client";

interface DialogTabsContentProps {
  newContact: Partial<Contact>;
}

const DialogTabsContent = React.memo(({ newContact }: DialogTabsContentProps) => {
  return (
    <>
      <TabsContent value="utm" className="space-y-4">
        {newContact.id ? (
          <ClientUTMData contactId={newContact.id} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <h3 className="text-lg font-medium mb-2">Dados UTM</h3>
            <p>Os dados UTM estarão disponíveis após salvar o cliente.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="midia" className="space-y-4">
        {newContact.id ? (
          <ClientFilesTab 
            clientId={newContact.id} 
            onFileUpdate={(files) => {
              console.log('Files updated:', files);
            }}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Mídia</h3>
            <p>Os arquivos de mídia estarão disponíveis após salvar o cliente.</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="produtos" className="space-y-4">
        {newContact.id ? (
          <ClientProductsTab clientId={newContact.id} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Produtos de Interesse</h3>
            <p>Os produtos de interesse estarão disponíveis após salvar o cliente.</p>
          </div>
        )}
      </TabsContent>
    </>
  );
});

DialogTabsContent.displayName = 'DialogTabsContent';

export default DialogTabsContent;