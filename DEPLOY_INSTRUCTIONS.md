# 🚀 Guia de Deploy - ValorDash no Portainer

## 📋 Pré-requisitos

- ✅ Portainer instalado na VPS
- ✅ Acesso SSH à VPS (31.97.26.252)
- ✅ Domínio configurado (comercial247.com.br)
- ✅ Supabase configurado com as tabelas

## 🔧 Arquivos Corrigidos

Os arquivos foram corrigidos e otimizados:

### ✅ **Dockerfile**
- Corrigido para usar `npm` (não yarn)
- Otimizado para Vite build
- Configuração de segurança com usuário não-root

### ✅ **docker-compose.portainer.yml**
- Removido Redis (desnecessário)
- Removido Nginx Proxy Manager (desnecessário)
- Simplificado para apenas a aplicação
- Health check corrigido
- **CORRIGIDO:** Removida configuração de rede que causava conflito
- **CORRIGIDO:** Removido container_name (não suportado no Portainer)
- **CORRIGIDO:** Build context corrigido para `.` (diretório local)

### ✅ **nginx.conf**
- Configuração simplificada para SPA React
- Headers de segurança
- Cache otimizado para assets estáticos
- Gzip compression

## 📦 Deploy via Portainer Stacks

### 1. **Acesse o Portainer**
```
URL: https://portainer.comercial247.com.br
Usuário: admin
Senha: Valorecomercial247@
```

### 2. **Crie um novo Stack**

1. Vá em **Stacks** → **Add stack**
2. Nome: `valoredash`
3. **Build method**: selecione **Repository**
4. **Repository URL**: `https://github.com/GCalebe/valoredash-v1-48.git`
5. **Repository reference**: `main`
6. **Repository authentication**: deixe vazio
7. **Compose path**: `docker-compose.portainer.yml`

### 3. **Configure as Variáveis de Ambiente**

Adicione estas variáveis no stack:

```yaml
Environment variables:
- NODE_ENV=production
- VITE_SUPABASE_URL=https://nkyvhwmjuksumizljclc.supabase.co
- VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk
```

### 4. **Deploy o Stack**

1. Clique em **Deploy the stack**
2. Aguarde o build (pode demorar 5-10 minutos)
3. Verifique os logs se houver erro

## 🌐 Configuração do Domínio

### Opção 1: Usando Nginx Proxy Manager (Recomendado)

Se você já tem o Nginx Proxy Manager rodando:

1. Acesse: `http://31.97.26.252:81`
2. Login: `admin@example.com` / `changeme`
3. Vá em **Proxy Hosts** → **Add Proxy Host**
4. Configure:
   - **Domain Names**: `valoredash.comercial247.com.br`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `valoredash-app` (nome do serviço)
   - **Forward Port**: `80`
   - **SSL**: Ative e configure certificado

### Opção 2: Acesso Direto

Acesse diretamente: `http://31.97.26.252:3000`

## 🔍 Verificação do Deploy

### 1. **Verificar Container**
```bash
# Via SSH na VPS
docker ps | grep valoredash
```

### 2. **Verificar Logs**
```bash
# Via SSH na VPS
docker logs valoredash-app
```

### 3. **Health Check**
Acesse: `http://31.97.26.252:3000/health`
Deve retornar: `healthy`

## 🛠️ Troubleshooting

### **Erro de Build Context (RESOLVIDO)**
- ❌ **Problema:** `invalid reference format`
- ❌ **Causa:** `build.context` usando URL do Git em vez de diretório local
- ✅ **Solução:** Alterado para `context: .` (diretório local)
- ✅ **Resultado:** Portainer pode fazer build corretamente

### **Erro de Rede (RESOLVIDO)**
- ❌ **Problema:** `Pool overlaps with other one on this address space`
- ✅ **Solução:** Removida configuração de subnet específica
- ✅ **Resultado:** Docker gerencia automaticamente a rede

### **Erro de Build**
- Verifique se o repositório está público
- Confirme se o branch `main` existe
- Verifique os logs do build no Portainer

### **Erro de Conexão**
- Verifique se a porta 3000 está liberada
- Confirme se o container está rodando
- Verifique os logs do container

### **Erro de Supabase**
- Confirme se as variáveis de ambiente estão corretas
- Verifique se o Supabase está acessível
- Confirme se as tabelas foram criadas

## 📊 Monitoramento

### **Logs no Portainer**
1. Vá em **Containers** → `valoredash-app`
2. Clique em **Logs**
3. Monitore erros e performance

### **Métricas**
1. Vá em **Containers** → `valoredash-app`
2. Clique em **Stats**
3. Monitore CPU, memória e rede

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das mudanças para o GitHub
2. No Portainer, vá em **Stacks** → `valoredash`
3. Clique em **Update the stack**
4. Aguarde o rebuild

## 🔒 Segurança

- ✅ Container roda como usuário não-root
- ✅ Headers de segurança configurados
- ✅ Arquivos sensíveis bloqueados
- ✅ Rate limiting configurado

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs primeiro
2. Confirme se todas as variáveis estão corretas
3. Teste o acesso local antes de configurar domínio

---

**🎉 Sua aplicação estará rodando em: `http://31.97.26.252:3000`**
