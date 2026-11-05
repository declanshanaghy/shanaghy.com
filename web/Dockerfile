# the garden's container — build the static export once, serve it with nginx
# build context must be web/ (the Dockerfile's own directory):
#   docker build -t shanaghy-garden ./web

FROM node:22-alpine AS build
WORKDIR /garden
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# the export lands in out/; the lost stone doubles as the 404, as Pages does
RUN npm run build && cp out/404/index.html out/404.html

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /garden/out/ /usr/share/nginx/html/
EXPOSE 8080
