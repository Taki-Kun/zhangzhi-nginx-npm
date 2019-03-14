FROM node:10.15.3-alpine as builder

ADD front-code-vue /data/front-code-vue
WORKDIR /data/front-code-vue
RUN npm install -g cnpm --registry=https://registry.npm.taobao.org
RUN cnpm install && cnpm run build

From nginx:latest as front

ADD front-code-vue.conf /etc/nginx/conf.d/

RUN rm -f /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html/front-code-vue

COPY --from=builder /data/front-code-vue/dist .
