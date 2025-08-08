// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

interface SaveAgendaParams {
  currentAgenda: any; // Omit<LocalAgenda, 'id'>
  reminders?: any[];
  operatingHours?: any;
  availableDates?: any;
  editingAgenda?: any; // LocalAgenda | null
  updateAgenda: (id: string, data: any) => Promise<void>;
  refetchAgendas: () => Promise<void>;
}

export async function saveAgendaWithRelations({
  currentAgenda,
  reminders,
  operatingHours,
  availableDates,
  editingAgenda,
  updateAgenda,
  refetchAgendas,
}: SaveAgendaParams): Promise<string> {
  // Retorna o ID da agenda salva
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const agendaData = {
    name: currentAgenda.title,
    description: currentAgenda.description,
    category: currentAgenda.category,
    duration_minutes: currentAgenda.duration,
    buffer_time_minutes: currentAgenda.breakTime,
    max_participants: currentAgenda.maxParticipants || 1,
    price: null,
    requires_approval: false,
    cancellation_policy: null,
    preparation_notes: null,
    follow_up_notes: null,
    is_active: true,
    service_types: currentAgenda.serviceTypes,
    created_by: user.id,
  };

  let agendaId: string;

  if (editingAgenda) {
    await updateAgenda(editingAgenda.id, agendaData);
    agendaId = editingAgenda.id;

    await Promise.all([
      supabase.from('employee_agendas').delete().eq('agenda_id', agendaId),
      supabase.from('agenda_reminders').delete().eq('agenda_id', agendaId),
      supabase.from('agenda_operating_hours').delete().eq('agenda_id', agendaId),
      supabase.from('agenda_available_dates').delete().eq('agenda_id', agendaId),
    ]);
  } else {
    const { data, error } = await supabase
      .from('agendas')
      .insert(agendaData)
      .select('id')
      .single();
    if (error || !data) throw error;
    agendaId = data.id;
  }

  // Associar anfitriões
  if (currentAgenda.host) {
    const hostIds = Array.isArray(currentAgenda.host) ? currentAgenda.host : [currentAgenda.host];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (let i = 0; i < hostIds.length; i++) {
      let hostId = hostIds[i];
      if (!uuidRegex.test(hostId)) {
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('name', hostId)
          .limit(1);
        if (employee && employee.length > 0) hostId = employee[0].id;
      }
      const isPrimary = i === 0;
      const priority = i + 1;
      const commissionPercentage = isPrimary ? 80 : 70;
      const { error: hostError } = await supabase.from('employee_agendas').insert({
        employee_id: hostId,
        agenda_id: agendaId,
        is_primary: isPrimary,
        priority,
        commission_percentage: commissionPercentage,
        is_active: true,
      });
      if (hostError) console.error(`Erro ao associar anfitrião ${i + 1}:`, hostError);
    }
  }

  // Lembretes
  if (reminders && reminders.length > 0) {
    const reminderData = reminders.map((reminder) => ({
      agenda_id: agendaId,
      reminder_type: reminder.channel || 'whatsapp',
      trigger_time_minutes: (reminder.days * 24 * 60) + (reminder.hours * 60) + reminder.minutes,
      message_template: reminder.subject,
      is_active: true,
      send_to_client: reminder.sendTo === 'inscrito',
      send_to_employee: reminder.sendTo === 'anfitriao',
      created_by: user.id,
    }));
    const { error: reminderError } = await supabase.from('agenda_reminders').insert(reminderData);
    if (reminderError) console.error('Erro ao salvar lembretes:', reminderError);
  }

  // Horários de funcionamento
  if (operatingHours) {
    const operatingHoursData: any[] = [];
    const dayMapping: { [key: string]: number } = {
      'Domingo': 0,
      'Segunda-Feira': 1,
      'Terça-Feira': 2,
      'Quarta-Feira': 3,
      'Quinta-Feira': 4,
      'Sexta-Feira': 5,
      'Sábado': 6,
    };
    Object.entries(operatingHours).forEach(([dayName, hours]: [string, any]) => {
      if (Array.isArray(hours)) {
        hours.forEach((hour: any) => {
          operatingHoursData.push({
            agenda_id: agendaId,
            day_of_week: dayMapping[dayName],
            start_time: hour.start,
            end_time: hour.end,
            is_active: true,
            created_by: user.id,
          });
        });
      }
    });
    if (operatingHoursData.length > 0) {
      const { error: operatingHoursError } = await supabase.from('agenda_operating_hours').insert(operatingHoursData);
      if (operatingHoursError) console.error('Erro ao salvar horários de funcionamento:', operatingHoursError);
    }
  }

  // Datas disponíveis
  if (availableDates) {
    const availableDatesData: any[] = [];
    const monthMapping: { [key: string]: number } = {
      Janeiro: 1,
      Fevereiro: 2,
      Março: 3,
      Abril: 4,
      Maio: 5,
      Junho: 6,
      Julho: 7,
      Agosto: 8,
      Setembro: 9,
      Outubro: 10,
      Novembro: 11,
      Dezembro: 12,
    };
    const currentYear = new Date().getFullYear();
    Object.entries(availableDates).forEach(([monthName, dates]: [string, any]) => {
      if (Array.isArray(dates)) {
        dates.forEach((dateRange: any) => {
          for (let day = dateRange.start; day <= dateRange.end; day++) {
            const date = new Date(currentYear, monthMapping[monthName] - 1, day);
            availableDatesData.push({
              agenda_id: agendaId,
              date: date.toISOString().split('T')[0],
              is_available: true,
              reason: null,
              start_time: null,
              end_time: null,
              max_bookings: null,
              created_by: user.id,
            });
          }
        });
      }
    });
    if (availableDatesData.length > 0) {
      const { error: availableDatesError } = await supabase.from('agenda_available_dates').insert(availableDatesData);
      if (availableDatesError) console.error('Erro ao salvar datas disponíveis:', availableDatesError);
    }
  }

  await refetchAgendas();
  return agendaId;
}


