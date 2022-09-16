FROM node:18 as build

WORKDIR /app/
COPY . /app/

RUN npm install
RUN npm run build

FROM nginx:alpine
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/spa /var/www/dapnet
