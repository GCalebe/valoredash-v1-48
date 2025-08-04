import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseDocuments, Document, DocumentFormData } from '@/hooks/useSupabaseDocuments';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Filter,
  ArrowLeft,
  Calendar,
  Tag,
  FolderOpen,
  Grid3X3,
  List
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DOCUMENT_CATEGORIES = [
  'Contratos',
  'Relatórios',
  'Apresentações',
  'Manuais',
  'Políticas',
  'Formulários',
  'Outros'
];

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    documents,
    loading,
    uploading,
    addDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
    searchDocuments,
    getDocumentsByCategory
  } = useSupabaseDocuments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState<DocumentFormData>({
    titulo: '',
    content: '',
    type: 'text/plain',
    tags: [],
    category: '',
    description: ''
  });

  // Filter documents based on search and category
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.metadata.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.metadata.category === selectedCategory);
    }

    return filtered;
  }, [documents, searchTerm, selectedCategory]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchDocuments(value);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'all') {
      getDocumentsByCategory(category);
    }
  };

  const handleAddDocument = async () => {
    const success = await addDocument(newDocument);
    if (success) {
      setIsAddDialogOpen(false);
      setNewDocument({
        titulo: '',
        content: '',
        type: 'text/plain',
        tags: [],
        category: '',
        description: ''
      });
    }
  };

  const handleEditDocument = async () => {
    if (!selectedDocument) return;
    
    const success = await updateDocument(selectedDocument.id, {
      titulo: selectedDocument.titulo,
      content: selectedDocument.content,
      tags: selectedDocument.metadata.tags,
      category: selectedDocument.metadata.category,
      description: selectedDocument.metadata.description
    });
    
    if (success) {
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      await deleteDocument(id);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Check file type (only text files for now)
    if (!file.type.startsWith('text/') && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast({
        title: 'Tipo de arquivo não suportado',
        description: 'Apenas arquivos de texto são suportados',
        variant: 'destructive',
      });
      return;
    }

    await uploadFile(file);
    event.target.value = ''; // Reset input
  };

  const handleDownloadDocument = (document: Document) => {
    const blob = new Blob([document.content], { type: document.metadata.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.titulo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openViewDialog = (document: Document) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (document: Document) => {
    setSelectedDocument(document);
    setIsEditDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
              <p className="text-muted-foreground">
                Gerencie seus documentos e arquivos
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.md,text/*"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Enviando...' : 'Upload'}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Documento</DialogTitle>
                  <DialogDescription>
                    Crie um novo documento de texto
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={newDocument.titulo}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Digite o título do documento"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newDocument.category}
                        onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                      <Input
                        id="tags"
                        value={newDocument.tags?.join(', ') || ''}
                        onChange={(e) => setNewDocument(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Breve descrição do documento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea
                      id="content"
                      value={newDocument.content}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Digite o conteúdo do documento"
                      rows={10}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddDocument} disabled={uploading || !newDocument.titulo || !newDocument.content}>
                    {uploading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {DOCUMENT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documents Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando seu primeiro documento ou fazendo upload de um arquivo'
                }
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Documento
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{document.titulo}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(document.metadata.uploadedAt), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {document.metadata.category && (
                      <Badge variant="secondary">
                        <FolderOpen className="h-3 w-3 mr-1" />
                        {document.metadata.category}
                      </Badge>
                    )}
                    {document.metadata.tags?.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {document.metadata.tags && document.metadata.tags.length > 2 && (
                      <Badge variant="outline">+{document.metadata.tags.length - 2}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {document.metadata.description || document.content.substring(0, 150) + '...'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(document)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="outline">
                      {Math.round(document.metadata.size / 1024)} KB
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.titulo}</div>
                        {document.metadata.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {document.metadata.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.metadata.category && (
                        <Badge variant="secondary">{document.metadata.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {document.metadata.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.metadata.tags && document.metadata.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.metadata.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{Math.round(document.metadata.size / 1024)} KB</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(document.metadata.uploadedAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(document)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* View Document Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.titulo}</DialogTitle>
              <DialogDescription>
                {selectedDocument?.metadata.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDocument?.metadata.category && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    {selectedDocument.metadata.category}
                  </Badge>
                  {selectedDocument.metadata.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {selectedDocument?.content}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
              {selectedDocument && (
                <Button onClick={() => handleDownloadDocument(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Document Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Documento</DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias no documento
              </DialogDescription>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-titulo">Título</Label>
                  <Input
                    id="edit-titulo"
                    value={selectedDocument.titulo}
                    onChange={(e) => setSelectedDocument(prev => prev ? { ...prev, titulo: e.target.value } : null)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select
                      value={selectedDocument.metadata.category || ''}
                      onValueChange={(value) => setSelectedDocument(prev => prev ? {
                        ...prev,
                        metadata: { ...prev.metadata, category: value }
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="edit-tags"
                      value={selectedDocument.metadata.tags?.join(', ') || ''}
                      onChange={(e) => setSelectedDocument(prev => prev ? {
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }
                      } : null)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Input
                    id="edit-description"
                    value={selectedDocument.metadata.description || ''}
                    onChange={(e) => setSelectedDocument(prev => prev ? {
                      ...prev,
                      metadata: { ...prev.metadata, description: e.target.value }
                    } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-content">Conteúdo</Label>
                  <Textarea
                    id="edit-content"
                    value={selectedDocument.content}
                    onChange={(e) => setSelectedDocument(prev => prev ? { ...prev, content: e.target.value } : null)}
                    rows={10}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditDocument} disabled={uploading}>
                {uploading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Documents;