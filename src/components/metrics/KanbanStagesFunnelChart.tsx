
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CalendarIcon, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useKanbanStagesFunnelData } from "@/hooks/useKanbanStagesFunnelData";
import { useKanbanStagesSupabase } from "@/hooks/useKanbanStagesSupabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FunnelStageData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

const KanbanStagesFunnelChart: React.FC = () => {
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    to: new Date(),
  });
  const [showFilters, setShowFilters] = useState(false);

  // Usar hook padronizado do Supabase
  const { stages, loading: stagesLoading } = useKanbanStagesSupabase();
  const { data: funnelData, loading, refetch, error } = useKanbanStagesFunnelData({
    stageIds: selectedStageIds,
    dateRange,
  });

  // Cores do funil seguindo o padrão da imagem
  const funnelColors = [
    "#FF6B6B", // Vermelho coral
    "#FFD93D", // Amarelo
    "#6BCF7F", // Verde claro
    "#4ECDC4", // Turquesa
    "#45B7D1", // Azul claro
    "#96CEB4", // Verde menta
    "#FECA57", // Laranja claro
    "#FF9FF3", // Rosa
    "#54A0FF", // Azul
    "#5F27CD", // Roxo
  ];

  // Inicializar com todos os estágios selecionados
  useEffect(() => {
    if (stages.length > 0 && selectedStageIds.length === 0) {
      console.log('🎯 Inicializando estágios selecionados:', stages.map(s => s.id));
      setSelectedStageIds(stages.map((stage) => stage.id));
    }
  }, [stages, selectedStageIds.length]);

  // Preparar dados do funil com cores e mapeamento correto
  const funnelStageData: FunnelStageData[] = funnelData.map((item, index) => {
    // Encontrar o estágio correspondente pelo ID para obter informações adicionais
    const stageInfo = stages.find(s => s.id === item.stageId || s.title === item.stage);
    
    return {
      stage: item.stage,
      count: item.count,
      percentage: item.percentage,
      color: funnelColors[index % funnelColors.length],
    };
  });

  const maxCount = Math.max(...funnelStageData.map(item => item.count), 1);

  const handleStageToggle = (stageId: string) => {
    console.log('🔄 Alternando estágio:', stageId);
    setSelectedStageIds(prev => 
      prev.includes(stageId)
        ? prev.filter(s => s !== stageId)
        : [...prev, stageId]
    );
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    if (date) {
      console.log(`📅 Alterando ${field}:`, date);
      setDateRange(prev => ({ ...prev, [field]: date }));
    }
  };

  // Log para debug
  useEffect(() => {
    console.log('📊 Estado atual do componente:', {
      stagesCount: stages.length,
      selectedStageIds,
      funnelDataCount: funnelData.length,
      loading,
      stagesLoading,
      error
    });
  }, [stages, selectedStageIds, funnelData, loading, stagesLoading, error]);

  if (stagesLoading) {
    return (
      <Card className="dark:bg-gray-800 transition-all duration-300">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800 transition-all duration-300">
        <CardContent className="h-96 flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-center">{error}</p>
          <Button onClick={refetch} className="mt-4" variant="outline">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <TrendingUp className="h-5 w-5 text-primary" />
          Funil de Estágios do Kanban
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                {/* Filtro de Data */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Período</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          selected={dateRange.from}
                          onSelect={(date) => handleDateRangeChange('from', date)}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          selected={dateRange.to}
                          onSelect={(date) => handleDateRangeChange('to', date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Filtro de Estágios */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estágios</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {stages.map((stage) => (
                      <div key={stage.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={stage.id}
                          checked={selectedStageIds.includes(stage.id)}
                          onCheckedChange={() => handleStageToggle(stage.id)}
                        />
                        <Label htmlFor={stage.id} className="text-sm">
                          {stage.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => refetch()} 
                  className="w-full" 
                  size="sm"
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Aplicar Filtros'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : funnelStageData.length > 0 ? (
          <div className="space-y-4">
            {/* Funil Visual */}
            <div className="relative h-96 flex flex-col justify-center items-center space-y-1">
              {funnelStageData.map((stage, index) => {
                const widthPercentage = (stage.count / maxCount) * 100;
                const height = 40;
                
                return (
                  <div key={`${stage.stage}-${index}`} className="w-full flex flex-col items-center">
                    {/* Barra do Funil */}
                    <div className="relative w-full max-w-lg">
                      <div
                        className="mx-auto rounded-lg shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg"
                        style={{
                          width: `${Math.max(widthPercentage, 15)}%`,
                          height: `${height}px`,
                          backgroundColor: stage.color,
                          clipPath: index === 0 
                            ? 'none' 
                            : `polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Labels */}
                      <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                        <div className="text-right mr-2">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {stage.stage}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stage.count} ({stage.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              {funnelStageData.map((stage, index) => (
                <div key={`legend-${stage.stage}-${index}`} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div className="text-xs">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {stage.stage}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {stage.count} contatos
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Período de criação:</strong> {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                <strong>Total de contatos criados no período:</strong> {funnelStageData.reduce((sum, stage) => sum + stage.count, 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
                Este funil mostra a distribuição atual dos contatos criados no período selecionado pelos estágios do kanban.
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Nenhum dado encontrado</p>
            <p className="text-sm">Ajuste os filtros para ver dados do funil</p>
            {stages.length === 0 && (
              <p className="text-xs mt-2 text-red-500">
                Nenhum estágio de kanban configurado
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KanbanStagesFunnelChart;
