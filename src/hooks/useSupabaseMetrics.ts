import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { DashboardMetrics, ConversationMetrics, SupabaseResponse } from '../types/supabase'

// Fetch dashboard metrics
export const getDashboardMetrics = async (): Promise<SupabaseResponse<DashboardMetrics>> => {
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .single()
    return { data, error, success: !error }
  } catch (err) {
    return { data: null, error: err, success: false }
  }
}

// Fetch metrics by date range via RPC
export const getMetricsByDateRange = async (startDate?: string, endDate?: string): Promise<SupabaseResponse<ConversationMetrics[]>> => {
  try {
    const { data, error } = await supabase.rpc('get_metrics_by_date_range', {
      start_date: startDate,
      end_date: endDate
    })

    const withDefaults = data?.map(item => ({
      ...item,
      id: `metrics_${Date.now()}`,
      total_respondidas: item.total_conversations || 0,
      avg_response_time: 0,
      avg_closing_time: 0,
      avg_response_start_time: 0,
      secondary_response_rate: 0,
      total_secondary_responses: 0,
      average_negotiated_value: item.negotiated_value || 0,
      total_negotiating_value: item.negotiated_value || 0,
      previous_period_value: 0,
      is_stale: false,
      created_at: new Date().toISOString()
    }))

    return { data: withDefaults, error, success: !error }
  } catch (err) {
    return { data: null, error: err, success: false }
  }
}

// Simple realtime metrics hook
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const result = await getDashboardMetrics()
      if (result.success) setMetrics(result.data)
      else setError(result.error?.message || 'Erro ao carregar métricas')
      setLoading(false)
    }

    load()

    const sub = supabase
      .channel('dashboard_metrics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_metrics' }, () => {
        load()
      })
      .subscribe()

    return () => { sub.unsubscribe() }
  }, [])

  return { metrics, loading, error }
}
