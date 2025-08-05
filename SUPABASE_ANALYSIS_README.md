# 🔍 Analisador de Conexões Supabase - ValoreDash

Este conjunto de scripts automatiza a busca por dados mockados e conexões soltas do Supabase no projeto ValoreDash.

## 📋 Arquivos Incluídos

- **`analyze_supabase_connections.py`** - Script principal em Python para análise detalhada
- **`analyze_supabase.ps1`** - Script PowerShell para análise rápida e complementar
- **`run_analysis.bat`** - Interface de menu para execução fácil
- **`SUPABASE_ANALYSIS_README.md`** - Esta documentação

## 🚀 Como Usar

### Opção 1: Interface de Menu (Recomendado)
```bash
# Execute o arquivo batch
run_analysis.bat
```

### Opção 2: Execução Direta

#### Análise Completa (Python)
```bash
python analyze_supabase_connections.py
```

#### Análise Rápida (PowerShell)
```bash
powershell -ExecutionPolicy Bypass -File analyze_supabase.ps1
```

#### Com Parâmetros
```bash
# PowerShell com opções
powershell -ExecutionPolicy Bypass -File analyze_supabase.ps1 -Detailed -OnlyHighSeverity
```

## 📊 Tipos de Análise

### 🔴 Issues de Alta Prioridade
- Dados sensíveis hardcoded (emails, telefones)
- Queries Supabase não utilizadas
- Configurações de desenvolvimento em produção

### 🟡 Issues de Média Prioridade
- Dados mockados em componentes
- TODOs relacionados a dados
- Strings longas hardcoded

### 🟢 Issues de Baixa Prioridade
- Tabelas Supabase não utilizadas
- Imports não utilizados
- Comentários de desenvolvimento

## 📈 Relatórios Gerados

### JSON Report (`supabase_analysis_report.json`)
```json
{
  "MOCK_DATA": [...],
  "HARDCODED_DATA": [...],
  "UNUSED_SUPABASE_QUERIES": [...],
  "TODO_COMMENTS": [...],
  "UNUSED_TABLES": [...]
}
```

### Console Output
- Resumo executivo com estatísticas
- Lista de issues por categoria
- Recomendações de correção

## 🎯 O Que o Script Detecta

### ✅ Dados Mockados
- `mockData`, `mock_data`, `MOCK_DATA`
- Arrays de objetos hardcoded
- Dados de teste em componentes

### ✅ Dados Hardcoded
- UUIDs hardcoded
- Emails e telefones em código
- Strings longas suspeitas

### ✅ Conexões Supabase
- Uso de `.from()`, `useQuery`, `useMutation`
- Tabelas definidas vs utilizadas
- Queries não conectadas

### ✅ TODOs e Comentários
- `TODO.*data`, `FIXME.*mock`
- Comentários de desenvolvimento
- Código temporário

## 📁 Estrutura de Análise

```
src/
├── components/     # Componentes React
├── hooks/         # Hooks personalizados
├── pages/         # Páginas da aplicação
├── integrations/  # Integrações Supabase
└── types/         # Definições TypeScript
```

## 🛠️ Requisitos

- **Python 3.7+** (para análise completa)
- **PowerShell 5.0+** (para análise rápida)
- **Windows** (scripts otimizados para Windows)

## 📋 Exemplo de Saída

```
🔍 Analisador de Conexões Supabase - ValoreDash
============================================================

📊 RESUMO EXECUTIVO
============================================================
Total de issues: 100
Issues de alta prioridade: 6
Tabelas do Supabase: 89
Tabelas utilizadas: 37
Tabelas não utilizadas: 55

⚠️ ATENÇÃO: Issues de alta prioridade encontradas!
   Recomenda-se revisar e corrigir antes da produção.
```

## 🔧 Personalização

### Adicionar Novos Padrões
Edite o arquivo `analyze_supabase_connections.py`:

```python
# Adicionar novos padrões de mock data
mock_patterns = [
    r'mockData',
    r'MOCK_DATA',
    r'seu_novo_padrao_aqui'
]
```

### Filtrar Diretórios
```python
# Excluir diretórios da análise
exclude_dirs = {
    'node_modules', 'dist', 'build', 
    'seu_diretorio_aqui'
}
```

## 🚨 Interpretação dos Resultados

### 🔴 Ação Imediata Necessária
- **Dados sensíveis expostos**: Remover emails/telefones hardcoded
- **Queries não utilizadas**: Limpar código morto
- **Configurações de dev**: Mover para variáveis de ambiente

### 🟡 Revisar e Planejar
- **Dados mockados**: Substituir por dados reais ou variáveis
- **TODOs antigos**: Implementar ou remover
- **Código temporário**: Refatorar ou documentar

### 🟢 Otimização Futura
- **Tabelas não usadas**: Considerar remoção do schema
- **Imports desnecessários**: Limpeza de código
- **Comentários**: Atualizar documentação

## 📞 Suporte

Para dúvidas ou melhorias nos scripts:
1. Verifique os logs de erro no console
2. Confirme que todos os requisitos estão instalados
3. Execute com parâmetros de debug: `-Detailed`

## 🔄 Atualizações

Para manter os scripts atualizados:
1. Adicione novos padrões conforme necessário
2. Atualize a lista de tabelas Supabase
3. Ajuste os filtros de diretórios

---

**Desenvolvido para ValoreDash** 🚀
*Automatizando a qualidade do código e conexões de banco de dados*