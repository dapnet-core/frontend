FROM node:22 AS build

WORKDIR /app/

# Copy package data without all other files so 'npm install' is cached
COPY package.json package-lock.json post-install.sh /app/
RUN SKIP_NPM_POSTINSTALL=y npm install

# post-install requires all files to be copied and the Quasar CLI
COPY . /app/
RUN npm i -g @quasar/cli && ./post-install.sh

ARG api_server=""
# API_SERVER is passed into 'quasar.config.js'
RUN API_SERVER=$api_server npm run build

FROM nginx:alpine
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/spa /var/www/dapnet
