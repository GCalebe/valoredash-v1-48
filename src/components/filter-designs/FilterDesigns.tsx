import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Layers, 
  Sparkles, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Star,
  Filter,
  Zap,
  PanelLeft,
  Smartphone
} from 'lucide-react';

import { FilterDesignOption1 } from './FilterDesignOption1';
import { FilterDesignOption2 } from './FilterDesignOption2';
import { FilterDesignOption3 } from './FilterDesignOption3';

interface DesignOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  pros: string[];
  cons: string[];
  complexity: 'Baixa' | 'Média' | 'Alta';
  responsiveness: 'Boa' | 'Excelente';
  userExperience: 'Boa' | 'Muito Boa' | 'Excelente';
}

export const FilterDesigns = () => {
  const [selectedDesign, setSelectedDesign] = useState('option1');
  const [showComparison, setShowComparison] = useState(false);

  const designOptions: DesignOption[] = [
    {
      id: 'option1',
      name: 'Design Moderno com Cards',
      description: 'Interface limpa e organizada com cards expansíveis e filtros bem estruturados',
      icon: <Layers className="w-5 h-5" />,
      features: [
        'Cards expansíveis para organização',
        'Filtros categorizados',
        'Busca principal integrada',
        'Visualização de filtros ativos',
        'Interface responsiva'
      ],
      pros: [
        'Fácil de usar e entender',
        'Boa organização visual',
        'Adequado para desktop e mobile',
        'Implementação simples'
      ],
      cons: [
        'Pode ocupar muito espaço vertical',
        'Menos dinâmico que outras opções'
      ],
      complexity: 'Baixa',
      responsiveness: 'Excelente',
      userExperience: 'Boa'
    },
    {
      id: 'option2',
      name: 'Painel Lateral Deslizante',
      description: 'Painel lateral retrátil com filtros organizados em categorias colapsáveis',
      icon: <PanelLeft className="w-5 h-5" />,
      features: [
        'Painel lateral retrátil',
        'Filtros salvos e favoritos',
        'Categorias colapsáveis',
        'Busca dentro dos filtros',
        'Gestão de filtros personalizados'
      ],
      pros: [
        'Economiza espaço na tela principal',
        'Permite salvar configurações',
        'Boa para usuários avançados',
        'Muitas opções de personalização'
      ],
      cons: [
        'Pode ser complexo para novos usuários',
        'Requer mais cliques para acessar filtros'
      ],
      complexity: 'Média',
      responsiveness: 'Boa',
      userExperience: 'Muito Boa'
    },
    {
      id: 'option3',
      name: 'Barra Flutuante Inteligente',
      description: 'Barra flutuante com IA que sugere filtros baseados no comportamento do usuário',
      icon: <Sparkles className="w-5 h-5" />,
      features: [
        'Barra flutuante sempre visível',
        'Sugestões inteligentes com IA',
        'Filtros adaptativos',
        'Interface moderna e dinâmica',
        'Insights em tempo real'
      ],
      pros: [
        'Experiência mais inteligente',
        'Sempre acessível',
        'Interface moderna e atrativa',
        'Sugestões personalizadas'
      ],
      cons: [
        'Maior complexidade de implementação',
        'Pode ser distrativo para alguns usuários',
        'Requer dados para IA funcionar bem'
      ],
      complexity: 'Alta',
      responsiveness: 'Excelente',
      userExperience: 'Excelente'
    }
  ];

  const currentDesign = designOptions.find(d => d.id === selectedDesign);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Palette className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Opções de Design para Filtros</h1>
                <p className="text-gray-600">Compare e escolha o melhor design para a tela de filtros</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={showComparison ? "default" : "outline"}
                onClick={() => setShowComparison(!showComparison)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {showComparison ? 'Ocultar' : 'Mostrar'} Comparação
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {showComparison ? (
          /* Modo Comparação */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Comparação de Designs
                </CardTitle>
                <CardDescription>
                  Análise detalhada das três opções de design propostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Critério</th>
                        {designOptions.map((design) => (
                          <th key={design.id} className="text-center p-4 font-semibold">
                            <div className="flex items-center justify-center gap-2">
                              {design.icon}
                              {design.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Complexidade</td>
                        {designOptions.map((design) => (
                          <td key={design.id} className="text-center p-4">
                            <Badge 
                              variant={design.complexity === 'Baixa' ? 'default' : 
                                      design.complexity === 'Média' ? 'secondary' : 'destructive'}
                            >
                              {design.complexity}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Responsividade</td>
                        {designOptions.map((design) => (
                          <td key={design.id} className="text-center p-4">
                            <Badge variant={design.responsiveness === 'Excelente' ? 'default' : 'secondary'}>
                              {design.responsiveness}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Experiência do Usuário</td>
                        {designOptions.map((design) => (
                          <td key={design.id} className="text-center p-4">
                            <Badge 
                              variant={design.userExperience === 'Excelente' ? 'default' : 
                                      design.userExperience === 'Muito Boa' ? 'secondary' : 'outline'}
                            >
                              {design.userExperience}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-medium">Principais Recursos</td>
                        {designOptions.map((design) => (
                          <td key={design.id} className="p-4">
                            <ul className="text-sm space-y-1">
                              {design.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Detalhes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {designOptions.map((design) => (
                <Card key={design.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {design.icon}
                      {design.name}
                    </CardTitle>
                    <CardDescription>{design.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        Vantagens
                      </h4>
                      <ul className="text-sm space-y-1">
                        {design.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                        <ThumbsDown className="w-4 h-4" />
                        Desvantagens
                      </h4>
                      <ul className="text-sm space-y-1">
                        {design.cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedDesign(design.id);
                        setShowComparison(false);
                      }}
                    >
                      Visualizar Design
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Modo Visualização */
          <div className="space-y-6">
            {/* Seletor de Design */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Selecione um Design para Visualizar</h2>
                  <Badge variant="outline" className="gap-2">
                    <Star className="w-3 h-3" />
                    {currentDesign?.name}
                  </Badge>
                </div>
                <Tabs value={selectedDesign} onValueChange={setSelectedDesign}>
                  <TabsList className="grid w-full grid-cols-3">
                    {designOptions.map((design) => (
                      <TabsTrigger key={design.id} value={design.id} className="gap-2">
                        {design.icon}
                        <span className="hidden sm:inline">{design.name}</span>
                        <span className="sm:hidden">Opção {design.id.slice(-1)}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Informações do Design Atual */}
            {currentDesign && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentDesign.icon}
                      <div>
                        <CardTitle>{currentDesign.name}</CardTitle>
                        <CardDescription>{currentDesign.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{currentDesign.complexity} Complexidade</Badge>
                      <Badge variant="outline">{currentDesign.userExperience} UX</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Principais Recursos
                      </h4>
                      <ul className="space-y-2">
                        {currentDesign.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Vantagens</h5>
                        <ul className="space-y-1">
                          {currentDesign.pros.slice(0, 2).map((pro, index) => (
                            <li key={index} className="text-xs flex items-start gap-1">
                              <ThumbsUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Considerações</h5>
                        <ul className="space-y-1">
                          {currentDesign.cons.slice(0, 2).map((con, index) => (
                            <li key={index} className="text-xs flex items-start gap-1">
                              <ThumbsDown className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visualização do Design */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Visualização: {currentDesign?.name}
                    </CardTitle>
                    <CardDescription>
                      Preview interativo do design selecionado
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Smartphone className="w-3 h-3" />
                      Responsivo
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="min-h-[800px] bg-white">
                  {selectedDesign === 'option1' && <FilterDesignOption1 />}
                  {selectedDesign === 'option2' && <FilterDesignOption2 />}
                  {selectedDesign === 'option3' && <FilterDesignOption3 />}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDesigns;