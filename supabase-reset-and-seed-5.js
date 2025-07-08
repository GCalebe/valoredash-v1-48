// Verificar e inserir dados para funnel_data
    if (await tableExists('funnel_data')) {
      // Tentar várias combinações de colunas para funnel_data
      const funnelDataCombinations = [
        // Combinação 1: leads e prospects
        {
          id: uuidv4(),
          stage: 'all',
          leads: 5,
          prospects: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 2: leads_count e prospects_count
        {
          id: uuidv4(),
          stage: 'all',
          leads_count: 5,
          prospects_count: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 3: count_leads e count_prospects
        {
          id: uuidv4(),
          stage: 'all',
          count_leads: 5,
          count_prospects: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 4: lead_count e prospect_count
        {
          id: uuidv4(),
          stage: 'all',
          lead_count: 5,
          prospect_count: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 5: total_leads e total_prospects
        {
          id: uuidv4(),
          stage: 'all',
          total_leads: 5,
          total_prospects: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 6: value e count
        {
          id: uuidv4(),
          stage: 'all',
          value: 5,
          count: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 7: apenas campos obrigatórios
        {
          id: uuidv4(),
          stage: 'all',
          created_at: new Date().toISOString()
        }
      ];
      
      let funnelDataInserted = false;
      
      // Tentar cada combinação até uma funcionar
      for (const funnelData of funnelDataCombinations) {
        const { error } = await supabase.from('funnel_data').insert(funnelData);
        
        if (!error) {
          console.log(`Dados de funnel_data inseridos com sucesso usando a combinação: ${Object.keys(funnelData).filter(k => k !== 'id' && k !== 'created_at').join(', ')}`);
          funnelDataInserted = true;
          break;
        } else {
          console.log(`Tentativa falhou com colunas: ${Object.keys(funnelData).filter(k => k !== 'id' && k !== 'created_at').join(', ')}`);
          console.log(`Erro: ${error.message}`);
        }
      }
      
      if (!funnelDataInserted) {
        console.error('Todas as combinações para funnel_data falharam.');
      }
    } else {
      console.log('Tabela funnel_data não existe. Ignorando.');
    }