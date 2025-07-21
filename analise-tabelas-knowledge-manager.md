# Análise de Tabelas - Gerenciador de Conhecimento

## Resumo Executivo

Este documento apresenta uma análise detalhada das tabelas necessárias para implementar completamente as funcionalidades das abas **Agendas**, **Anfitriões** e **Produtos** do Gerenciador de Conhecimento, comparando com as tabelas existentes no banco Supabase.

## 📋 Tabelas Analisadas nos Formulários

### 1. **AgendaTab.tsx** - Criação de Agendas

**Campos identificados no formulário:**
- `id`, `title`, `description`, `category`, `host`
- `duration`, `breakTime`, `availabilityInterval`
- `availableDates` (ranges de mês/dia)
- `operatingHours` (horários diários)
- `minimumNotice`
- `actionAfterRegistration`, `successMessage`, `redirectUrl`
- `sendReminders`, `reminders` (configurações de lembrete)

**Estrutura de dados complexa:**
- Múltiplos horários de funcionamento
- Configurações de lembretes automáticos
- Ações pós-registro personalizáveis
- Categorias de agenda (consulta, evento, classes, recorrente)

### 2. **HostsTab.tsx** - Gerenciamento de Anfitriões

**Campos identificados no formulário:**
- `name`, `role`, `description`
- `selectedAgendas` (relacionamento many-to-many)
- Integração com tabela `employees` existente

### 3. **ProductForm.tsx** - Produtos/Serviços

**Campos identificados no formulário:**
- Informações básicas: `name`, `price`, `category`, `description`
- Arrays de dados: `benefits`, `objections`, `differentials`, `success_cases`, `features`
- Configurações: `has_combo`, `has_upgrade`, `has_promotion`, `new`, `popular`
- Mídia: `icon`, `image`

## 🗄️ Tabelas Existentes no Supabase

### ✅ Tabelas Já Implementadas

1. **`employees`** - Anfitriões
   ```sql
   - id, name, role, description
   - available_days[], available_hours[]
   - created_at, updated_at, user_id
   ```

2. **`ai_products`** - Produtos (parcial)
   ```sql
   - id, name, category, description
   - features[], icon, image
   - new, popular
   ```

3. **`contacts`** - Clientes/Contatos
   ```sql
   - Estrutura completa para CRM
   ```

4. **`calendar_events`** - Eventos de Calendário
   ```sql
   - title, description, start_time, end_time
   - contact_id, user_id, status
   ```

5. **`appointments`** - Agendamentos
   ```sql
   - appointment_date, contact_id, user_id
   - duration_minutes, status, notes
   ```

## ❌ Tabelas Faltantes

### 1. **`agendas`** - Configurações de Agenda
```sql
CREATE TABLE agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL, -- 'consulta', 'evento', 'classes', 'recorrente'
  host_id UUID REFERENCES employees(id),
  duration INTEGER NOT NULL, -- em minutos
  break_time INTEGER DEFAULT 0,
  availability_interval INTEGER DEFAULT 30,
  minimum_notice INTEGER DEFAULT 60, -- em minutos
  action_after_registration VARCHAR DEFAULT 'success_message',
  success_message TEXT,
  redirect_url VARCHAR,
  send_reminders BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **`agenda_available_dates`** - Datas Disponíveis
```sql
CREATE TABLE agenda_available_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE,
  start_month INTEGER NOT NULL,
  start_day INTEGER NOT NULL,
  end_month INTEGER NOT NULL,
  end_day INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **`agenda_operating_hours`** - Horários de Funcionamento
```sql
CREATE TABLE agenda_operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 1=segunda, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **`agenda_reminders`** - Configurações de Lembretes
```sql
CREATE TABLE agenda_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE,
  days_before INTEGER DEFAULT 0,
  hours_before INTEGER DEFAULT 1,
  minutes_before INTEGER DEFAULT 0,
  subject VARCHAR NOT NULL,
  send_to VARCHAR NOT NULL, -- 'inscrito', 'anfitriao', 'ambos'
  channels VARCHAR[] DEFAULT ARRAY['whatsapp'], -- 'whatsapp', 'email', 'sms'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. **`employee_agendas`** - Relacionamento Anfitrião-Agenda
```sql
CREATE TABLE employee_agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  agenda_id UUID REFERENCES agendas(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, agenda_id)
);
```

### 6. **Extensão da tabela `ai_products`**
```sql
-- Adicionar colunas faltantes
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS objections TEXT[];
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS differentials TEXT[];
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS success_cases TEXT[];
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS has_combo BOOLEAN DEFAULT false;
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS has_upgrade BOOLEAN DEFAULT false;
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS has_promotion BOOLEAN DEFAULT false;
ALTER TABLE ai_products ADD COLUMN IF NOT EXISTS user_id UUID;
```

### 7. **`agenda_bookings`** - Reservas de Agenda
```sql
CREATE TABLE agenda_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agenda_id UUID REFERENCES agendas(id),
  contact_id UUID REFERENCES contacts(id),
  appointment_id UUID REFERENCES appointments(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Relacionamentos Necessários

### Diagrama de Relacionamentos
```
agendas (1) ←→ (N) agenda_available_dates
agendas (1) ←→ (N) agenda_operating_hours  
agendas (1) ←→ (N) agenda_reminders
agendas (1) ←→ (N) agenda_bookings
agendas (N) ←→ (N) employees (via employee_agendas)
contacts (1) ←→ (N) agenda_bookings
appointments (1) ←→ (1) agenda_bookings
```

## 📊 Impacto e Priorização

### 🔴 **Alta Prioridade** (Funcionalidade Básica)
1. **`agendas`** - Tabela principal para configurações
2. **`agenda_operating_hours`** - Horários de funcionamento
3. **`employee_agendas`** - Relacionamento anfitrião-agenda
4. **Extensão `ai_products`** - Campos faltantes para produtos

### 🟡 **Média Prioridade** (Funcionalidades Avançadas)
5. **`agenda_available_dates`** - Controle de disponibilidade
6. **`agenda_bookings`** - Sistema de reservas

### 🟢 **Baixa Prioridade** (Automação)
7. **`agenda_reminders`** - Sistema de lembretes automáticos

## 🛠️ Sugestões de Implementação

### Fase 1: Estrutura Básica
1. Criar tabela `agendas` com campos essenciais
2. Implementar `agenda_operating_hours` para horários
3. Criar relacionamento `employee_agendas`
4. Estender tabela `ai_products` com campos faltantes

### Fase 2: Sistema de Reservas
1. Implementar `agenda_bookings`
2. Integrar com `appointments` existente
3. Criar validações de conflito de horários

### Fase 3: Funcionalidades Avançadas
1. Implementar `agenda_available_dates`
2. Sistema de lembretes `agenda_reminders`
3. Integração com notificações (WhatsApp, Email)

### Fase 4: Otimizações
1. Índices para performance
2. Views para consultas complexas
3. Triggers para auditoria

## 🔍 Considerações Técnicas

### Validações Necessárias
- **Conflitos de horário**: Verificar sobreposição de agendamentos
- **Horários válidos**: `start_time < end_time`
- **Disponibilidade**: Respeitar `agenda_available_dates`
- **Antecedência mínima**: Validar `minimum_notice`

### Performance
- Índices em `agenda_id`, `employee_id`, `booking_date`
- Particionamento por data para `agenda_bookings`
- Cache para consultas de disponibilidade

### Segurança
- RLS (Row Level Security) por `user_id`
- Validação de permissões para edição
- Auditoria de alterações críticas

## 📈 Métricas de Sucesso

### KPIs para Monitoramento
1. **Taxa de utilização** das agendas criadas
2. **Tempo médio** de configuração de nova agenda
3. **Conflitos de agendamento** detectados
4. **Taxa de conversão** agenda → agendamento

### Dashboards Sugeridos
- Visão geral de agendas por anfitrião
- Relatório de ocupação por período
- Análise de efetividade de lembretes

---

**Conclusão**: A implementação completa requer 6 novas tabelas e extensão de 1 existente. O foco inicial deve ser na estrutura básica (Fase 1) para viabilizar as funcionalidades core do gerenciador de conhecimento.