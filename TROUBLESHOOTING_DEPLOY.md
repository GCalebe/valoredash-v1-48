# 🔧 Troubleshooting - Deploy Falhou

## ❌ **Problema Identificado:**
- ✅ Stack criado no Portainer
- ❌ Container não foi buildado
- ❌ Aplicação não está rodando

## 🔍 **Investigações Necessárias:**

### **1. 📋 Verificar Logs do Stack**
No Portainer:
1. Vá em **Stacks** → `valoredash`
2. Clique em **Logs**
3. **Copie e cole** os logs de erro aqui

### **2. 📋 Verificar Status do Container**
No Portainer:
1. Vá em **Containers**
2. Procure por `valoredash-app`
3. Qual o status? (Running, Stopped, Error?)

### **3. 📋 Verificar Build Logs**
No Portainer:
1. Vá em **Stacks** → `valoredash`
2. Clique em **Build logs**
3. **Copie e cole** os logs de build

### **4. 📋 Verificar via SSH**
Execute na VPS:
```bash
# Listar containers
docker ps -a | grep valoredash

# Ver logs do container (se existir)
docker logs valoredash-app

# Ver imagens
docker images | grep valoredash

# Verificar espaço em disco
df -h

# Verificar memória
free -h
```

## 🚨 **Possíveis Causas:**

### **1. 🔧 Problema de Build**
- **Dockerfile** com erro
- **Dependências** não encontradas
- **Espaço em disco** insuficiente
- **Memória** insuficiente

### **2. 🌐 Problema de Rede**
- **Repositório** não acessível
- **Git** não consegue clonar
- **Firewall** bloqueando

### **3. ⚙️ Problema de Configuração**
- **Variáveis de ambiente** incorretas
- **Porta** já em uso
- **Permissões** incorretas

## 🛠️ **Soluções Rápidas:**

### **Solução 1: Verificar Repositório**
```bash
# Testar se o repositório está acessível
curl -I https://github.com/GCalebe/valoredash-v1-48.git
```

### **Solução 2: Testar Build Local**
```bash
# Via SSH na VPS
git clone https://github.com/GCalebe/valoredash-v1-48.git
cd valoredash-v1-48
docker build -t valoredash-test .
```

### **Solução 3: Verificar Espaço**
```bash
# Verificar espaço disponível
df -h
docker system df
```

## 📋 **Checklist de Debug:**

- [ ] 🔍 Logs do Stack copiados
- [ ] 🔍 Status do Container verificado
- [ ] 🔍 Build logs analisados
- [ ] 🔍 Espaço em disco verificado
- [ ] 🔍 Repositório acessível
- [ ] 🔍 Docker funcionando

## 🚀 **Próximos Passos:**

1. **Cole os logs de erro** aqui
2. **Execute os comandos SSH** sugeridos
3. **Me informe os resultados**
4. **Vou identificar e corrigir** o problema

---

**🔧 Vamos resolver isso juntos!**
