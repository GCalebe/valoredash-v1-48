import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import ClientUTMData from "./ClientUTMData";
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
        <div className="text-center py-8 text-gray-500">
          <h3 className="text-lg font-medium mb-2">Mídia</h3>
          <p>Upload de imagens, vídeos ou documentos.</p>
          <p className="text-sm mt-2">Em desenvolvimento</p>
        </div>
      </TabsContent>

      <TabsContent value="produtos" className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          <h3 className="text-lg font-medium mb-2">Produtos de Interesse</h3>
          <p>Selecione os produtos náuticos de interesse do cliente.</p>
          <p className="text-sm mt-2">Em desenvolvimento</p>
        </div>
      </TabsContent>
    </>
  );
});

DialogTabsContent.displayName = 'DialogTabsContent';

export default DialogTabsContent;