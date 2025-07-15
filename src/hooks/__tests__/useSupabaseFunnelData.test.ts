import { vi, describe, it, expect } from 'vitest'
import { useSupabaseFunnelData } from '../useSupabaseFunnelData'

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

describe('useSupabaseFunnelData', () => {
  it('should have required exports', () => {
    const hook = useSupabaseFunnelData()
    expect(hook).toHaveProperty('getFunnelData')
    expect(hook).toHaveProperty('getFunnelByDateRange')
    expect(hook).toHaveProperty('addFunnelData')
  })
})
