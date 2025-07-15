import { vi, describe, it, expect } from 'vitest'
import { getContacts } from '../useSupabaseContactsData'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [{ id: 'a', kanban_stage_id: null }], error: null })
    }))
  }
}))

describe('getContacts', () => {
  it('returns contact data on success', async () => {
    const result = await getContacts()
    expect(result.success).toBe(true)
    expect(result.data?.length).toBe(1)
  })
})
