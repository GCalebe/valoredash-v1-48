import { vi, describe, it, expect } from 'vitest'
import { getFunnelData } from '../useSupabaseFunnelData'

vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [{ id: 'f1' }], error: null })
    }))
  }
}))

describe('getFunnelData', () => {
  it('returns funnel list', async () => {
    const data = await getFunnelData()
    expect(data.length).toBe(1)
  })
})
