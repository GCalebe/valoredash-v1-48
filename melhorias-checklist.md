## Checklist de Melhorias no Agendamento

### Passo 1: Refatorar o `useScheduleState`

- [x] Criar o hook `useAgendaSelection`.
- [x] Criar o hook `useAppointmentForm`.
- [x] Criar o hook `useScheduleDialogs`.
- [x] Mover a lógica relevante do `useScheduleState` para os novos hooks.
- [x] Atualizar os componentes para usar os novos hooks.

### Passo 2: Melhorar o Tratamento de Erros

- [x] Modificar o `useCalendarEvents` para retornar informações de erro mais específicas.
- [x] Atualizar o `EventFormDialog` para exibir mensagens de erro específicas.

### Passo 3: Otimizar a Busca de Dados

- [x] Analisar o `useCalendarEvents` e o `calendarCache`.
- [x] Implementar o cache de eventos por mês.
- [x] Modificar a lógica para buscar novos dados apenas ao navegar para um novo mês.

### Passo 4: Refatorar o `ScheduleContent`

- [x] Criar o componente `EventList`.
- [x] Criar o componente `EventSidebar`.
- [x] Mover a lógica relevante do `ScheduleContent` para os novos componentes.

### Passo 6: Adicionar Feedback ao Usuário

- [x] Adicionar um indicador de carregamento ao botão de envio no `EventFormDialog`.
