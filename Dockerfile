FROM node:18 as build

WORKDIR /app/

# Copy package data manually so 'npm install' is cached
COPY package.json package-lock.json /app/
RUN npm install

COPY . /app/
ARG api_server=""
# API_SERVER is passed into 'quasar.config.js'
RUN API_SERVER=$api_server npm run build

FROM nginx:alpine
COPY --from=build /app/dist/spa /var/www/dapnet
