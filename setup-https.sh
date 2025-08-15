#!/bin/bash

# Script para configurar HTTPS automaticamente
# Uso: ./setup-https.sh

DOMAIN="comercial247.com.br"
EMAIL="admin@comercial247.com.br"

echo "🚀 Configurando HTTPS para $DOMAIN..."

# 1. Criar diretórios necessários
mkdir -p ssl
mkdir -p certbot-etc
mkdir -p certbot-var

# 2. Substituir placeholders nos arquivos (já configurado)
echo "✅ Arquivos já configurados para $DOMAIN"

# 3. Parar stack atual (se existir)
docker-compose -f docker-compose.web-editor.yml down 2>/dev/null || true

# 4. Iniciar com HTTPS
docker-compose -f docker-compose.https.yml up -d nginx-proxy

# 5. Aguardar nginx iniciar
echo "⏳ Aguardando Nginx iniciar..."
sleep 10

# 6. Gerar certificado SSL
echo "🔒 Gerando certificado SSL..."
docker-compose -f docker-compose.https.yml run --rm certbot

# 7. Reiniciar nginx com certificado
echo "🔄 Reiniciando Nginx com certificado..."
docker-compose -f docker-compose.https.yml restart nginx-proxy

# 8. Iniciar aplicação
echo "🚀 Iniciando aplicação..."
docker-compose -f docker-compose.https.yml up -d valoredash-app

echo "✅ Configuração HTTPS concluída!"
echo "🌐 Acesse: https://$DOMAIN"
echo "📧 Certificado renovará automaticamente"
