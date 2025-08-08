import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterDesignOption1 } from '@/components/filter-designs/FilterDesignOption1';
import { FilterDesignOption2 } from '@/components/filter-designs/FilterDesignOption2';
import { FilterDesignOption3 } from '@/components/filter-designs/FilterDesignOption3';
import { Palette, Layers, Zap } from 'lucide-react';

const FilterDesigns = () => {
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  const designs = [
    {
      id: 'modern-card',
      title: 'Design Moderno com Cards',
      description: 'Interface limpa com cards organizados e animações suaves',
      icon: <Palette className="w-5 h-5" />,
      features: ['Cards organizados', 'Animações suaves', 'Layout responsivo', 'Cores modernas'],
      component: FilterDesignOption1
    },
    {
      id: 'sidebar-panel',
      title: 'Painel Lateral Deslizante',
      description: 'Filtros em painel lateral com categorização avançada',
      icon: <Layers className="w-5 h-5" />,
      features: ['Painel deslizante', 'Categorização', 'Busca rápida', 'Filtros salvos'],
      component: FilterDesignOption2
    },
    {
      id: 'floating-toolbar',
      title: 'Barra Flutuante Inteligente',
      description: 'Toolbar flutuante com filtros contextuais e IA',
      icon: <Zap className="w-5 h-5" />,
      features: ['Barra flutuante', 'Filtros inteligentes', 'Sugestões IA', 'Ações rápidas'],
      component: FilterDesignOption3
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Opções de Design para Filtros</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore três abordagens diferentes para melhorar a experiência de filtros.
          Cada design oferece uma perspectiva única de usabilidade e funcionalidade.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modern-card">Design Moderno</TabsTrigger>
          <TabsTrigger value="sidebar-panel">Painel Lateral</TabsTrigger>
          <TabsTrigger value="floating-toolbar">Barra Flutuante</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {designs.map((design) => {
              const IconComponent = design.icon;
              return (
                <Card 
                  key={design.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedDesign === design.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDesign(design.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {IconComponent}
                      <CardTitle className="text-lg">{design.title}</CardTitle>
                    </div>
                    <CardDescription>{design.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {design.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navegar para a aba específica
                          const tabTrigger = document.querySelector(`[value="${design.id}"]`) as HTMLElement;
                          tabTrigger?.click();
                        }}
                      >
                        Ver Demonstração
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedDesign && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Design Selecionado</CardTitle>
                <CardDescription>
                  {designs.find(d => d.id === selectedDesign)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {designs.find(d => d.id === selectedDesign)?.description}
                </p>
                <Button 
                  onClick={() => {
                    const tabTrigger = document.querySelector(`[value="${selectedDesign}"]`) as HTMLElement;
                    tabTrigger?.click();
                  }}
                >
                  Ver Demonstração Completa
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {designs.map((design) => {
          const Component = design.component;
          return (
            <TabsContent key={design.id} value={design.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {design.icon}
                    <CardTitle>{design.title}</CardTitle>
                  </div>
                  <CardDescription>{design.description}</CardDescription>
                </CardHeader>
              </Card>
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default FilterDesigns;