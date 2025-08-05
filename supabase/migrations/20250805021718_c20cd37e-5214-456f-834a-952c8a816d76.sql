-- Inserir agendamentos de teste para agosto de 2025 para visualização na tela do calendário
INSERT INTO agenda_bookings (
  agenda_name, 
  client_name, 
  client_email, 
  client_phone, 
  booking_date, 
  start_time, 
  end_time, 
  status, 
  duration_minutes,
  notes,
  employee_name
) VALUES 
  (
    'Consulta Médica', 
    'João Silva', 
    'joao@email.com', 
    '(11) 99999-1111', 
    '2025-08-05', 
    '09:00:00', 
    '10:00:00', 
    'confirmed', 
    60,
    'Consulta de rotina',
    'Dr. Carlos'
  ),
  (
    'Reunião de Negócios', 
    'Maria Santos', 
    'maria@empresa.com', 
    '(11) 99999-2222', 
    '2025-08-05', 
    '14:00:00', 
    '15:30:00', 
    'confirmed', 
    90,
    'Discussão de projeto',
    'João Gerente'
  ),
  (
    'Sessão de Terapia', 
    'Pedro Costa', 
    'pedro@email.com', 
    '(11) 99999-3333', 
    '2025-08-06', 
    '16:00:00', 
    '17:00:00', 
    'pending', 
    60,
    'Primeira sessão',
    'Dra. Ana'
  ),
  (
    'Aula de Yoga', 
    'Carla Oliveira', 
    'carla@email.com', 
    '(11) 99999-4444', 
    '2025-08-07', 
    '08:00:00', 
    '09:00:00', 
    'confirmed', 
    60,
    'Aula em grupo',
    'Instrutora Paula'
  ),
  (
    'Consulta Nutricional', 
    'Roberto Lima', 
    'roberto@email.com', 
    '(11) 99999-5555', 
    '2025-08-08', 
    '10:30:00', 
    '11:30:00', 
    'confirmed', 
    60,
    'Avaliação nutricional',
    'Nutricionista Lúcia'
  );