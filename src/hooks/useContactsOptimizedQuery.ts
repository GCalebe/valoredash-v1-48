interface SimpleContact {
   id: string;
   name: string;
   email?: string;
   phone?: string;
   kanban_stage_id?: string;
   created_at?: string;
   updated_at?: string;
   sales?: number;
   budget?: number;
}

interface ContactFilters {
  search?: string;
  kanban_stage?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

const fetchContacts = async (filters: ContactFilters = {}): Promise<SimpleContact[]> => {
  let query = supabase
    .from('contacts')
    .select('id, name, email, phone, kanban_stage_id, created_at, sales, budget')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.kanban_stage) {
    query = query.eq('kanban_stage_id', filters.kanban_stage);
  }
}

queryFn: async (): Promise<SimpleContact[]> => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, phone, kanban_stage_id, created_at, sales, budget')
        .eq('kanban_stage_id', stage)
        .order('created_at', { ascending: false })
        .limit(100);
}

queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('kanban_stage_id, created_at')
        .limit(1000);

      const stats = {
        total: contacts.length,
        byStage: contacts.reduce((acc, contact) => {
          const stage = contact.kanban_stage_id || 'unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
}