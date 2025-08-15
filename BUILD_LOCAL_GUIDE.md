# 🔧 Build Local - Debug do Deploy

## 📋 **Comandos para Executar na VPS:**

### **1. 🔍 Clonar o Repositório**
```bash
# Navegar para diretório temporário
cd /tmp

# Clonar o repositório
git clone https://github.com/GCalebe/valoredash-v1-48.git

# Entrar no diretório
cd valoredash-v1-48

# Verificar arquivos
ls -la
```

### **2. 🔍 Verificar Arquivos Essenciais**
```bash
# Verificar se o Dockerfile existe
ls -la Dockerfile

# Verificar se o docker-compose existe
ls -la docker-compose.portainer.yml

# Verificar se o package.json existe
ls -la package.json
```

### **3. 🔍 Testar Build Local**
```bash
# Fazer build da imagem
docker build -t valoredash-local .

# Verificar se a imagem foi criada
docker images | grep valoredash
```

### **4. 🔍 Testar Container Local**
```bash
# Executar o container localmente
docker run -d -p 3001:80 --name valoredash-test valoredash-local

# Verificar se está rodando
docker ps | grep valoredash

# Ver logs do container
docker logs valoredash-test
```

### **5. 🔍 Testar Acesso Local**
```bash
# Testar se a aplicação responde
curl -I http://localhost:3001

# Testar health check
curl http://localhost:3001/health
```

## 🚨 **Possíveis Problemas e Soluções:**

### **Problema 1: Dockerfile não encontrado**
```bash
# Verificar se existe
ls -la Dockerfile
# Se não existir, o problema é no repositório
```

### **Problema 2: Erro no build**
```bash
# Ver logs completos do build
docker build -t valoredash-local . 2>&1 | tee build.log
```

### **Problema 3: Dependências não encontradas**
```bash
# Verificar se package.json existe
cat package.json
```

### **Problema 4: Porta em uso**
```bash
# Verificar se a porta 3000 está em uso
netstat -tlnp | grep :3000
```

## 📊 **Resultados Esperados:**

### **✅ Build Sucesso:**
- Imagem criada: `valoredash-local`
- Container rodando na porta 3001
- Health check retorna "healthy"
- Aplicação acessível em `http://localhost:3001`

### **❌ Build Falha:**
- Erro específico no log
- Imagem não criada
- Container não inicia

## 🚀 **Próximos Passos:**

1. **Execute os comandos** acima na VPS
2. **Cole os resultados** aqui
3. **Identifico o problema** específico
4. **Corrijo o Dockerfile** se necessário

---

**🔧 Vamos fazer o build local e resolver isso!**
