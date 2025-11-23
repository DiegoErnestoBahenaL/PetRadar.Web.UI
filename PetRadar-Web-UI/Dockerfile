# Etapa de build Angular
FROM node:20.19.5-alpine AS build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .


RUN npm run build 

# Etapa de runtime con Nginx
FROM nginx:stable-alpine AS runtime

# Eliminamos la config default y ponemos la nuestra (SPA + fallback y CORS opcional)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Importante: ajusta la ruta del build según tu angular.json
# Típicamente: dist/<nombre-proyecto>/browser
COPY --from=build /app/dist/PetRadar-Web-UI/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
