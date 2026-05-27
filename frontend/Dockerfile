# Faza gradnje (build stage)
FROM node:20-alpine AS builder

# Nastavitev delovnega imenika
WORKDIR /app

# Kopiranje package.json (pomaga pri shranjevanju v predpomnilnik)
COPY package*.json ./

# Namestitev vseh odvisnosti
RUN npm install

# Kopiranje izvorne kode
COPY . .

# Gradnja frontend aplikacije
RUN npm run build

# Faza izvajanja (run stage) - lahek web strežnik
FROM nginx:alpine

# Kopiranje zgrajenih datotek iz prve faze v nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiranje po meri nastavitve za Nginx za React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Odprtje vrat
EXPOSE 80

# Zagon Nginx
CMD ["nginx", "-g", "daemon off;"]
