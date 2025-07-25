import { useMemo } from 'react';

// Interfaces para validação
export interface DataValidationResult<T> {
  data: T;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataQualityScore {
  score: number; // 0-100
  completeness: number; // 0-100
  accuracy: number; // 0-100
  freshness: number; // 0-100
}

// Função para validar métricas
const validateMetrics = (metrics: unknown): DataValidationResult<unknown> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações básicas
  if (metrics.totalLeads < 0) {
    errors.push('Total de leads não pode ser negativo');
  }

  if (metrics.responseRate < 0 || metrics.responseRate > 100) {
    errors.push('Taxa de resposta deve estar entre 0% e 100%');
  }

  if (metrics.conversionRate < 0 || metrics.conversionRate > 100) {
    errors.push('Taxa de conversão deve estar entre 0% e 100%');
  }

  if (metrics.avgResponseTime < 0) {
    errors.push('Tempo médio de resposta não pode ser negativo');
  }

  // Validações de consistência
  if (metrics.totalRespondidas > metrics.totalConversations) {
    errors.push('Conversas respondidas não pode ser maior que total de conversas');
  }

  if (metrics.conversasNaoRespondidas + metrics.totalRespondidas !== metrics.totalConversations) {
    warnings.push('Soma de conversas respondidas e não respondidas não confere com o total');
  }

  // Validações de plausibilidade
  if (metrics.responseRate > 95) {
    warnings.push('Taxa de resposta muito alta (>95%) - verificar dados');
  }

  if (metrics.conversionRate > 50) {
    warnings.push('Taxa de conversão muito alta (>50%) - verificar dados');
  }

  if (metrics.avgResponseTime > 24) {
    warnings.push('Tempo médio de resposta muito alto (>24h) - verificar dados');
  }

  // Verificar dados faltantes
  const requiredFields = [
    'totalLeads', 'totalConversations', 'responseRate', 
    'conversionRate', 'avgResponseTime', 'ticketMedio'
  ];
  
  for (const field of requiredFields) {
    if (metrics[field] === undefined || metrics[field] === null) {
      warnings.push(`Campo obrigatório faltando: ${field}`);
    }
  }

  return {
    data: metrics,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Função para validar dados de série temporal
const validateTimeSeriesData = (data: unknown[]): DataValidationResult<any[]> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Dados de série temporal devem ser um array');
    return { data: [], isValid: false, errors, warnings };
  }

  if (data.length === 0) {
    warnings.push('Nenhum dado de série temporal encontrado');
  }

  // Validar cada ponto de dados
  data.forEach((point, index) => {
    if (!point.date) {
      errors.push(`Data faltando no ponto ${index + 1}`);
    }

    if (point.leads < 0) {
      errors.push(`Leads negativos no ponto ${index + 1}`);
    }

    if (point.converted > point.leads) {
      warnings.push(`Conversões maiores que leads no ponto ${index + 1}`);
    }

    if (point.respondidas + point.naoRespondidas !== point.iniciadas) {
      warnings.push(`Inconsistência nas conversas no ponto ${index + 1}`);
    }
  });

  // Verificar ordenação por data
  for (let i = 1; i < data.length; i++) {
    const prevDate = new Date(data[i - 1].date);
    const currDate = new Date(data[i].date);
    
    if (currDate < prevDate) {
      warnings.push('Dados não estão ordenados por data');
      break;
    }
  }

  return {
    data,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Função para calcular qualidade dos dados
const calculateDataQuality = (
  metricsValidation: DataValidationResult<unknown>,
  timeSeriesValidation: DataValidationResult<any[]>,
  lastUpdate?: string
): DataQualityScore => {
  // Completeness: baseado na presença de campos obrigatórios
  const totalFields = 10; // número de campos esperados
  const missingFields = metricsValidation.warnings.filter(w => 
    w.includes('Campo obrigatório faltando')
  ).length;
  const completeness = Math.max(0, (totalFields - missingFields) / totalFields * 100);

  // Accuracy: baseado no número de erros e warnings
  const totalIssues = metricsValidation.errors.length + 
                     metricsValidation.warnings.length + 
                     timeSeriesValidation.errors.length + 
                     timeSeriesValidation.warnings.length;
  const accuracy = Math.max(0, 100 - (totalIssues * 10));

  // Freshness: baseado na última atualização
  let freshness = 100;
  if (lastUpdate) {
    const updateTime = new Date(lastUpdate);
    const now = new Date();
    const diffMinutes = (now.getTime() - updateTime.getTime()) / (1000 * 60);
    
    if (diffMinutes > 60) {
      freshness = Math.max(0, 100 - ((diffMinutes - 60) / 60 * 10));
    }
  }

  // Score geral (média ponderada)
  const score = Math.round(
    (completeness * 0.4) + 
    (accuracy * 0.4) + 
    (freshness * 0.2)
  );

  return {
    score,
    completeness: Math.round(completeness),
    accuracy: Math.round(accuracy),
    freshness: Math.round(freshness),
  };
};

// Hook principal
export const useValidatedData = (metrics: unknown, timeSeriesData: unknown[], lastUpdate?: string) => {
  return useMemo(() => {
    // Validar métricas
    const metricsValidation = validateMetrics(metrics || {});
    
    // Validar dados de série temporal
    const timeSeriesValidation = validateTimeSeriesData(timeSeriesData || []);
    
    // Calcular qualidade dos dados
    const dataQuality = calculateDataQuality(
      metricsValidation, 
      timeSeriesValidation, 
      lastUpdate
    );
    
    // Consolidar todos os erros e warnings
    const allErrors = [
      ...metricsValidation.errors,
      ...timeSeriesValidation.errors,
    ];
    
    const allWarnings = [
      ...metricsValidation.warnings,
      ...timeSeriesValidation.warnings,
    ];

    return {
      metrics: metricsValidation,
      timeSeries: timeSeriesValidation,
      dataQuality,
      allErrors,
      allWarnings,
      isDataReliable: allErrors.length === 0 && dataQuality.score >= 70,
      hasWarnings: allWarnings.length > 0,
    };
  }, [metrics, timeSeriesData, lastUpdate]);
};