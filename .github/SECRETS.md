# 🔐 Configuração de Secrets do GitHub Actions

Para que o deploy automático funcione, você precisa configurar os seguintes secrets no seu repositório GitHub.

## 📍 Como Configurar Secrets

1. Vá para seu repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret listado abaixo

## 🔑 Secrets Obrigatórios

### Configurações da VPS

| Nome | Descrição | Exemplo |
|------|-----------|----------|
| `VPS_HOST` | IP ou hostname da sua VPS | `192.168.1.100` ou `minha-vps.com` |
| `VPS_USER` | Usuário SSH da VPS | `ubuntu` |
| `VPS_SSH_KEY` | Chave privada SSH (conteúdo completo) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | Porta SSH (opcional, padrão: 22) | `22` |

### Configurações do Supabase

| Nome | Descrição | Onde Encontrar |
|------|-----------|----------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Dashboard Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase | Dashboard Supabase → Settings → API |

### Configurações da Aplicação

| Nome | Descrição | Exemplo |
|------|-----------|----------|
| `APP_URL` | URL da sua aplicação | `https://meuapp.com` |
| `SSL_DOMAIN` | Domínio para SSL | `meuapp.com` |
| `SSL_EMAIL` | Email para Let's Encrypt | `admin@meuapp.com` |
| `REDIS_PASSWORD` | Senha do Redis | `minha_senha_redis_123` |

## 🔑 Secrets Opcionais

### Notificações

| Nome | Descrição | Como Obter |
|------|-----------|------------|
| `SLACK_WEBHOOK` | Webhook do Slack para notificações | Slack → Apps → Incoming Webhooks |

### APIs Externas (se usar)

| Nome | Descrição |
|------|----------|
| `FACEBOOK_APP_ID` | ID da aplicação Facebook |
| `FACEBOOK_APP_SECRET` | Secret da aplicação Facebook |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Token de desenvolvedor Google Ads |
| `GOOGLE_ADS_CLIENT_ID` | Client ID Google Ads |
| `GOOGLE_ADS_CLIENT_SECRET` | Client Secret Google Ads |

## 🔐 Como Gerar Chave SSH

Se você não tem uma chave SSH configurada:

### 1. Gerar chave SSH (no seu computador local)

```bash
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "deploy@valoredash" -f ~/.ssh/valoredash_deploy

# Ou usar RSA se ed25519 não for suportado
ssh-keygen -t rsa -b 4096 -C "deploy@valoredash" -f ~/.ssh/valoredash_deploy
```

### 2. Copiar chave pública para VPS

```bash
# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/valoredash_deploy.pub ubuntu@seu-ip-vps

# Ou manualmente
cat ~/.ssh/valoredash_deploy.pub | ssh ubuntu@seu-ip-vps "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Testar conexão

```bash
# Testar se a chave funciona
ssh -i ~/.ssh/valoredash_deploy ubuntu@seu-ip-vps
```

### 4. Adicionar chave privada ao GitHub

```bash
# Mostrar chave privada (copie todo o conteúdo)
cat ~/.ssh/valoredash_deploy
```

Copie todo o conteúdo (incluindo `-----BEGIN` e `-----END`) e cole no secret `VPS_SSH_KEY`.

## 🌐 Configuração de Domínio

### DNS Records

Configure os seguintes registros DNS no seu provedor:

```
A    @              192.168.1.100  (seu IP da VPS)
A    www            192.168.1.100
A    *              192.168.1.100  (wildcard, opcional)
```

### Verificar Propagação DNS

```bash
# Verificar se DNS está propagado
nslookup seu-dominio.com
dig seu-dominio.com
```

## 🔍 Verificação dos Secrets

Após configurar todos os secrets, você pode verificar se estão corretos:

### 1. Testar conexão SSH

```bash
# No seu computador local
ssh -i ~/.ssh/valoredash_deploy ubuntu@seu-ip-vps "echo 'Conexão SSH OK'"
```

### 2. Testar Supabase

```bash
# Testar URL do Supabase
curl -I https://seu-projeto.supabase.co
```

### 3. Executar Deploy Manual

Vá para **Actions** no GitHub e execute o workflow manualmente para testar.

## 🚨 Segurança

### ✅ Boas Práticas

- ✅ Use chaves SSH específicas para deploy
- ✅ Configure usuário com permissões mínimas na VPS
- ✅ Use senhas fortes para Redis e outros serviços
- ✅ Mantenha secrets atualizados
- ✅ Revogue chaves antigas quando não precisar mais

### ❌ Nunca Faça

- ❌ Nunca commite secrets no código
- ❌ Nunca compartilhe chaves privadas
- ❌ Nunca use a mesma chave SSH para múltiplos projetos
- ❌ Nunca deixe senhas padrão em produção

## 🔧 Troubleshooting

### Erro de Conexão SSH

```bash
# Verificar se a chave está correta
ssh -i ~/.ssh/valoredash_deploy -v ubuntu@seu-ip-vps
```

### Erro de Permissões

```bash
# Na VPS, verificar permissões
ls -la ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Erro de Build

- Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretos
- Teste o build localmente: `npm run build`

### Erro de Deploy

- Verifique logs do GitHub Actions
- Conecte na VPS e verifique: `docker-compose logs`

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do GitHub Actions
2. Teste conexão SSH manualmente
3. Verifique se todos os secrets estão configurados
4. Teste Supabase connectivity
5. Verifique DNS do domínio

---

**Importante**: Mantenha todos os secrets seguros e atualizados. Revogue e regenere chaves periodicamente por segurança.