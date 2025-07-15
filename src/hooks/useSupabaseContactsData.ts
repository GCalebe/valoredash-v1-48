import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type {
  Contact,
  ContactInsert,
  ContactUpdate,
  ContactFilters,
  SupabaseResponse,
  PaginatedResponse
} from '../types/supabase'

// Fetch contacts with optional filters
export const getContacts = async (filters?: ContactFilters): Promise<SupabaseResponse<Contact[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = supabase.from('contacts').select('*').eq('user_id', user.id)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.kanbanStage) query = query.eq('kanban_stage_id', filters.kanbanStage)
    if (filters?.responsibleUser) query = query.eq('responsible_user', filters.responsibleUser)
    if (filters?.clientSector) query = query.eq('client_sector', filters.clientSector)
    if (filters?.dateRange) {
      query = query.gte('created_at', filters.dateRange.startDate).lte('created_at', filters.dateRange.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    const transformed = data?.map(c => ({
      ...c,
      kanbanStage: c.kanban_stage_id || 'Entraram',
      kanban_stage: c.kanban_stage_id || 'Entraram',
      custom_values: {}
    })) as Contact[]

    return { data: transformed, error, success: !error }
  } catch (err) {
    return { data: null, error: err, success: false }
  }
}

// Add contact
export const addContact = async (contact: ContactInsert): Promise<SupabaseResponse<Contact>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contact, user_id: user.id })
      .select()
      .single()

    const transformed = data ? {
      ...data,
      kanbanStage: data.kanban_stage_id || 'Entraram',
      kanban_stage: data.kanban_stage_id || 'Entraram',
      custom_values: {}
    } as Contact : null

    return { data: transformed, error, success: !error }
  } catch (err) {
    return { data: null, error: err, success: false }
  }
}

// Update contact
export const updateContact = async (id: string, updates: ContactUpdate): Promise<SupabaseResponse<Contact>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    const transformed = data ? {
      ...data,
      kanbanStage: data.kanban_stage_id || 'Entraram',
      kanban_stage: data.kanban_stage_id || 'Entraram',
      custom_values: {}
    } as Contact : null

    return { data: transformed, error, success: !error }
  } catch (err) {
    return { data: null, error: err, success: false }
  }
}

// Delete contact
export const deleteContact = async (id: string): Promise<SupabaseResponse<boolean>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return { data: !error, error, success: !error }
  } catch (err) {
    return { data: false, error: err, success: false }
  }
}

// Paginated contacts hook
export const useContacts = (filters?: ContactFilters, pageSize = 20): PaginatedResponse<Contact> => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const load = useCallback(async (current = 1) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase.from('contacts').select('*', { count: 'exact' }).eq('user_id', user.id)
      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.kanbanStage) query = query.eq('kanban_stage_id', filters.kanbanStage)
      if (filters?.responsibleUser) query = query.eq('responsible_user', filters.responsibleUser)
      if (filters?.clientSector) query = query.eq('client_sector', filters.clientSector)
      if (filters?.dateRange) {
        query = query.gte('created_at', filters.dateRange.startDate).lte('created_at', filters.dateRange.endDate)
      }

      const from = (current - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query.order('created_at', { ascending: false })
      if (error) {
        setError(error.message)
      } else {
        const transformed = data?.map(c => ({
          ...c,
          kanbanStage: c.kanban_stage_id || 'Entraram',
          kanban_stage: c.kanban_stage_id || 'Entraram',
          custom_values: {}
        })) as Contact[] || []
        setContacts(transformed)
        setTotalCount(count || 0)
        setPage(current)
      }
    } catch (err) {
      setError('Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }, [filters, pageSize])

  useEffect(() => { load(1) }, [load])

  const nextPage = () => { if (page < Math.ceil(totalCount / pageSize)) load(page + 1) }
  const prevPage = () => { if (page > 1) load(page - 1) }
  const goToPage = (p: number) => { if (p >= 1 && p <= Math.ceil(totalCount / pageSize)) load(p) }

  return {
    contacts,
    loading,
    error,
    page,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    nextPage,
    prevPage,
    goToPage,
    refetch: () => load(page)
  }
}
