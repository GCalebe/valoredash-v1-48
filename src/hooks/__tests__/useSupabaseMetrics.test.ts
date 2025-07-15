import { vi, describe, it, expect } from 'vitest'
import { getDashboardMetrics } from '../useSupabaseMetrics'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { total_clients: 1 }, error: null })
    }))
  }
}))

describe('getDashboardMetrics', () => {
  it('returns metrics on success', async () => {
    const result = await getDashboardMetrics()
    expect(result.success).toBe(true)
    expect(result.data?.total_clients).toBe(1)
  })
})
