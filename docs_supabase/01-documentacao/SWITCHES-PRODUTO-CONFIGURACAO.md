# Switches de Configuração de Produtos

## Visão Geral

Na tela de criação de produtos, na aba "Configurações", existem switches que quando ativados abrem campos condicionais para preenchimento de informações específicas. Essas informações são armazenadas no Supabase em tabelas relacionadas.

## Switches Disponíveis

### 1. Switch "Em Promoção" (`has_promotion`)

**Quando ativado, exibe os seguintes campos:**
- Nome da Promoção
- Descrição da Promoção
- Desconto (%)
- Data de Início
- Data de Fim

**Armazenamento no Supabase:**
- Tabela: `product_promotions`
- Campos salvos:
  - `product_id`: ID do produto
  - `name`: Nome da promoção
  - `description`: Descrição da promoção
  - `discount_percentage`: Percentual de desconto
  - `discount_amount`: Valor fixo de desconto
  - `start_date`: Data de início
  - `end_date`: Data de fim
  - `is_active`: Status ativo/inativo

### 2. Switch "Oferece Combo" (`has_combo`)

**Quando ativado, exibe os seguintes campos:**
- Nome do Combo
- Descrição do Combo
- Desconto do Combo (%)

**Armazenamento no Supabase:**
- Tabela principal: `product_combos`
- Tabela de relacionamento: `product_combo_items`
- Campos salvos:
  - `name`: Nome do combo
  - `description`: Descrição do combo
  - `discount_percentage`: Percentual de desconto do combo
  - Relacionamento produto-combo via `product_combo_items`

### 3. Switch "Oferece Upgrade" (`has_upgrade`)

**Quando ativado, exibe os seguintes campos:**
- Nome do Upgrade
- Descrição do Upgrade
- Preço do Upgrade (R$)
- Produto de Destino

**Armazenamento no Supabase:**
- Tabela: `product_upgrades`
- Campos salvos:
  - `base_product_id`: ID do produto base
  - `upgrade_product_id`: ID do produto de upgrade
  - `name`: Nome do upgrade
  - `description`: Descrição do upgrade
  - `upgrade_price`: Preço do upgrade
  - `benefits`: Array de benefícios
  - `is_active`: Status ativo/inativo

### 4. Switch "Produto Novo" (`new`)

**Comportamento:**
- Apenas marca o produto como novo na tabela `products`
- Não abre campos condicionais
- Campo: `new: boolean`

### 5. Switch "Produto Popular" (`popular`)

**Comportamento:**
- Apenas marca o produto como popular na tabela `products`
- Não abre campos condicionais
- Campo: `popular: boolean`

## Estrutura das Tabelas

### Tabela `product_promotions`
```sql
CREATE TABLE product_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage NUMERIC(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount NUMERIC(10,2) CHECK (discount_amount >= 0),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabela `product_upgrades`
```sql
CREATE TABLE product_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  upgrade_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  upgrade_price NUMERIC(10,2) CHECK (upgrade_price >= 0),
  benefits TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_product_id, upgrade_product_id)
);
```

### Tabelas de Combo (já existentes)
- `product_combos`: Informações do combo
- `product_combo_items`: Relacionamento produto-combo

## Implementação Frontend

### Campos Condicionais

Os campos condicionais são renderizados usando renderização condicional React:

```tsx
{watchedValues.has_promotion && (
  <div className="ml-6 space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
    <h4 className="font-medium text-orange-800">Configurações da Promoção</h4>
    {/* Campos da promoção */}
  </div>
)}
```

### Validação

Os campos são validados usando Zod schema:

```tsx
const productSchema = z.object({
  // ... outros campos
  promotion_name: z.string().nullable().optional(),
  discount_percentage: z.number().min(0).max(100).nullable().optional(),
  // ... outros campos condicionais
});
```

### Salvamento

O salvamento é feito em duas etapas:
1. Salvar o produto principal na tabela `products`
2. Salvar dados condicionais nas tabelas relacionadas se os switches estiverem ativados

```tsx
// Exemplo para promoção
if (productData.has_promotion && productData.promotion_name) {
  const promotionData = {
    product_id: createdProduct.id,
    name: productData.promotion_name,
    description: productData.promotion_description,
    // ... outros campos
  };

  await supabase.from('product_promotions').insert([promotionData]);
}
```

## UX/UI Design

### Cores e Estilos

- **Promoção**: Fundo laranja (`bg-orange-50`, `border-orange-200`)
- **Combo**: Fundo azul (`bg-blue-50`, `border-blue-200`)
- **Upgrade**: Fundo verde (`bg-green-50`, `border-green-200`)

### Comportamento

1. **Expansão Suave**: Os campos aparecem com animação suave quando o switch é ativado
2. **Indentação Visual**: Os campos condicionais são indentados (`ml-6`) para mostrar hierarquia
3. **Agrupamento**: Campos relacionados são agrupados em cards coloridos
4. **Validação em Tempo Real**: Validação acontece conforme o usuário digita

## Considerações Técnicas

### Tratamento de Erros

- Se o produto principal for criado com sucesso mas os dados condicionais falharem, o produto ainda é criado
- Erros em dados condicionais são logados como warnings, não como erros fatais
- Isso garante que o usuário não perca o trabalho por problemas em funcionalidades secundárias

### Performance

- Índices foram criados nas tabelas relacionadas para otimizar consultas
- Triggers automáticos atualizam `updated_at` quando necessário
- Constraints garantem integridade dos dados

### Extensibilidade

- A estrutura permite adicionar novos switches facilmente
- Cada switch pode ter sua própria tabela relacionada
- O padrão de renderização condicional é reutilizável

## Próximos Passos

1. **Implementar edição**: Adicionar lógica para editar dados condicionais existentes
2. **Visualização**: Criar componentes para exibir informações de promoções, combos e upgrades
3. **Relatórios**: Implementar relatórios específicos para cada tipo de configuração
4. **Validações avançadas**: Adicionar validações de negócio mais complexas

## Troubleshooting

### Problemas Comuns

1. **Campos não aparecem**: Verificar se o switch está realmente ativado no estado do formulário
2. **Dados não salvam**: Verificar se as tabelas relacionadas existem no banco
3. **Validação falha**: Verificar se os tipos de dados estão corretos no schema Zod

### Logs Úteis

- Console do navegador mostra warnings para dados condicionais que falharam
- Supabase logs mostram erros de banco de dados
- React DevTools permite inspecionar o estado do formulário