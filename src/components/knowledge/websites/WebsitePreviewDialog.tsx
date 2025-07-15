import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from './WebsiteCard';
import { type Website } from '@/hooks/useWebsiteManager';

interface WebsitePreviewDialogProps {
  website: Website | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WebsitePreviewDialog: React.FC<WebsitePreviewDialogProps> = ({ website, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Preview do Website</DialogTitle>
        <DialogDescription>Visualização do conteúdo indexado</DialogDescription>
      </DialogHeader>
      {website && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Informações do Website</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">URL:</span>
                  <div className="text-blue-500">{website.url}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>{getStatusBadge(website.status)}</div>
                </div>
                <div>
                  <span className="font-medium">Páginas indexadas:</span>
                  <div>{website.pages_indexed || 0}</div>
                </div>
                <div>
                  <span className="font-medium">Categoria:</span>
                  <div>{website.category}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Conteúdo Exemplo (simulado)</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Este é um exemplo de como o conteúdo indexado apareceria. O sistema faria a extração automática do texto das páginas do website, removendo elementos desnecessários como menus e rodapés, mantendo apenas o conteúdo principal que seria útil para responder perguntas dos usuários.
              </p>
            </div>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default WebsitePreviewDialog;
