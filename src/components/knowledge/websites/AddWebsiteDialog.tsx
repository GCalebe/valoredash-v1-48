import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (url: string, category: string) => void;
  isLoading?: boolean;
}

const AddWebsiteDialog: React.FC<AddWebsiteDialogProps> = ({ open, onOpenChange, onAdd, isLoading }) => {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = () => {
    onAdd(url, category);
    setUrl('');
    setCategory('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? 'Adicionando...' : 'Adicionar Website'}
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
            <Input id="url" placeholder="https://exemplo.com" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" placeholder="ex: Corporativo, Blog..." value={category} onChange={e => setCategory(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={isLoading}>
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWebsiteDialog;
