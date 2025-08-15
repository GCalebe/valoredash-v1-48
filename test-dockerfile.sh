#!/bin/bash

# Script para testar se o package-lock.json está sendo copiado

echo "🔍 Verificando se package-lock.json existe..."
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json encontrado"
    echo "📊 Tamanho: $(ls -lh package-lock.json | awk '{print $5}')"
else
    echo "❌ package-lock.json NÃO encontrado"
    exit 1
fi

echo ""
echo "🔍 Verificando se package.json existe..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json NÃO encontrado"
    exit 1
fi

echo ""
echo "🔍 Testando build Docker..."
echo "📦 Executando: docker build -t valoredash-test ."

# Fazer build e capturar saída
docker build -t valoredash-test . 2>&1 | tee build-test.log

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build bem-sucedido!"
    echo "🐳 Imagem criada: valoredash-test"
    
    echo ""
    echo "🔍 Testando container..."
    docker run -d -p 3001:80 --name valoredash-test-container valoredash-test
    
    if [ $? -eq 0 ]; then
        echo "✅ Container iniciado!"
        echo "🌐 Acesse: http://localhost:3001"
        
        echo ""
        echo "🔍 Verificando logs..."
        docker logs valoredash-test-container
        
        echo ""
        echo "🔍 Testando health check..."
        sleep 5
        curl -f http://localhost:3001/health || echo "❌ Health check falhou"
        
    else
        echo "❌ Falha ao iniciar container"
        docker logs valoredash-test-container
    fi
else
    echo ""
    echo "❌ Build falhou!"
    echo "📋 Logs do build:"
    cat build-test.log
fi

# Limpar
echo ""
echo "🧹 Limpando..."
docker stop valoredash-test-container 2>/dev/null
docker rm valoredash-test-container 2>/dev/null
docker rmi valoredash-test 2>/dev/null
rm -f build-test.log
