# syntax=docker/dockerfile:1

# Stage 1: Build da aplicação React
FROM node:18-alpine AS builder

# Instalar dependências do sistema necessárias
RUN apk add --no-cache git

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json primeiro
COPY package.json ./

# Copiar package-lock.json explicitamente
COPY package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Construir aplicação para produção
RUN npm run build

# Stage 2: Nginx para servir arquivos estáticos
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Remover configuração padrão do nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar diretórios necessários e ajustar permissões
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /var/run && \
    chmod 755 /var/run && \
    chmod 755 /var/cache/nginx && \
    chmod 755 /var/log/nginx

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]