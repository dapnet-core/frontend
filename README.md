# Dapnet Frontend

New multi-platform frontend for [DAPNET v2](https://github.com/dapnet-core)

## Getting started
### Using a full DAPNET node
See [this repository](https://github.com/dapnet-core/core) for setup instructions
### Using docker
Run
```bash
$ docker build -t dapnet-quasar:latest .
$ docker run -p 80:80 -v "$(pwd)"/docker/nginx.conf:/etc/nginx/nginx.conf:ro dapnet-quasar:latest
```
and open a webbrowser at [localhost](http://localhost). This will launch the production build, without an API server. You can specify one using `--build-arg api_server=<your_server>` in the first command

### Manually (recommended for development)

Install node.js (≥ 18) and npm (or any other package manager) and install the dependencies
```bash
npm install
```

After that you can launch the development profile with
```bash
API_SERVER=<your_server> npm run dev
```

It is advised to set up a local node too and connect to it's api server.
## Why this rework?
There already is a working [web frontend for DAPNET v2](https://github.com/dapnet-core/web/tree/vuetify), but its using lots of outdated dependencies and is hard to migrate and maintain. Additionally, it only covers the web; DAPNET v1 has apps for [Android](https://github.com/DecentralizedAmateurPagingNetwork/DAPNETApp) and [iOS](https://apps.apple.com/ca/app/dapnet/id1638627303), which DAPNET v2 should match.

This project uses [Quasar Framework](https://quasar.dev/introduction-to-quasar), which can deploy to both the web and mobile devices.
