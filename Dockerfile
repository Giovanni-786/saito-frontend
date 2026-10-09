# ---- build ----
# node:22-alpine traz a versão 22 mais recente; o Rolldown (Vite 8) exige >= 22.12.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variáveis VITE_* são embutidas no bundle em tempo de build.
# Vazia: o front chama "/api", que o nginx abaixo repassa para API_UPSTREAM.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---- runtime ----
FROM nginx:1.27-alpine

# Backend para onde o nginx repassa /api (só usado se VITE_API_URL ficar vazia).
ENV API_UPSTREAM=http://localhost:8080

# A imagem oficial do nginx roda envsubst nos *.template ao iniciar.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
