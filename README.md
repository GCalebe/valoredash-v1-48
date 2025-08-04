# 🚀 ValoreDash V1-48

> **Sistema de Gestão de Relacionamento com Cliente (CRM) integrado com Supabase**

## 📋 Sobre o Projeto

ValoreDash é uma plataforma completa de CRM desenvolvida em React + TypeScript, integrada com Supabase para gerenciamento de dados em tempo real. O sistema oferece funcionalidades avançadas para gestão de clientes, agendamentos, documentos, métricas e muito mais.

**URL do Projeto**: https://lovable.dev/projects/3b798310-9314-49a9-9604-c5927962c5fd

## ✨ Funcionalidades Principais

### 🏢 **Gestão de Clientes**
- Dashboard completo com métricas em tempo real
- Gerenciamento de contatos e leads
- Sistema de tags e categorização
- Histórico de interações

### 📅 **Sistema de Agendamentos**
- Calendário interativo
- Agendamentos recorrentes
- Notificações automáticas
- Gestão de disponibilidade

### 📄 **Gestão de Documentos** *(Novo!)*
- Upload e organização de arquivos
- Categorização por tipo
- Sistema de busca avançada
- Controle de acesso por usuário

### 💳 **Sistema de Assinaturas**
- Integração com Supabase para pagamentos
- Planos flexíveis
- Gestão de faturas
- Controle de acesso baseado em planos

### 📊 **Métricas e Relatórios**
- Dashboard em tempo real
- Relatórios personalizados
- Análise de conversão
- Exportação de dados

### 🔐 **Segurança e Controle**
- Autenticação via Supabase Auth
- Row Level Security (RLS)
- Controle de permissões
- Logs de auditoria

## 🆕 Atualizações Recentes

### **Janeiro 2025 - v1.48**
- ✅ **Sistema de Documentos**: Implementação completa do módulo de gestão de documentos
- ✅ **Correções de Bugs**: Resolvidos erros de sintaxe e importações
- ✅ **Melhorias de Performance**: Otimizações no sistema de assinaturas
- ✅ **Navegação Aprimorada**: Adicionado menu para documentos na sidebar
- ✅ **Integração Supabase**: Hooks personalizados para melhor gestão de dados

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3b798310-9314-49a9-9604-c5927962c5fd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Install pre-commit hooks (opcional)
python -m pip install pre-commit
pre-commit install

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

Para mais informações sobre o pre-commit, consulte o [guia de uso do pre-commit](docs/guias/pre-commit.md).

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca principal para UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Ícones
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Recharts** - Gráficos e visualizações

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Supabase Auth** - Autenticação
- **Supabase Storage** - Armazenamento de arquivos
- **Row Level Security (RLS)** - Segurança de dados

### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Pre-commit hooks** - Validação antes de commits
- **TypeScript** - Verificação de tipos

### **Bibliotecas Auxiliares**
- **date-fns** - Manipulação de datas
- **clsx** - Utilitário para classes CSS
- **React Query/TanStack Query** - Gerenciamento de estado servidor
- **Sonner** - Notificações toast
- **React Dropzone** - Upload de arquivos

## 🗄️ Documentação do Banco de Dados

### **Localização dos Scripts**
Toda a documentação e scripts do banco de dados estão organizados na pasta `docs_supabase/`:

```bash
npm run seed        # executa "node docs_supabase/supabase-data-seeder.js"
```

### **Documentação Disponível**
- **`DOCUMENTACAO_BANCO_DADOS.md`** - Documentação completa do schema do banco
- **`ESTRUTURA-PROJETO.md`** - Estrutura detalhada do projeto
- **`docs_supabase/`** - Scripts de seeding e configuração

### **Principais Tabelas**
- `profiles` - Perfis de usuários
- `subscriptions` - Assinaturas e planos
- `documents` - Sistema de documentos (novo!)
- `calendar_events` - Eventos do calendário
- `commercial_bookings` - Agendamentos comerciais
- `leads` - Gestão de leads
- `metrics` - Métricas do sistema

### **Recursos Avançados**
- **Row Level Security (RLS)** implementado em todas as tabelas
- **Triggers** para auditoria e logs
- **Functions** personalizadas para lógica de negócio
- **Embeddings** para busca semântica de documentos

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3b798310-9314-49a9-9604-c5927962c5fd) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
