FROM centos
LABEL maintainer="zhangzhi@163.com"

ADD node-v10.15.3-linux-x64.tar.xz /software
RUN mkdir /website && ln -s /software/node-v10.15.3-linux-x64/bin/node /usr/bin/node \
    && rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
    && yum -y install nginx net-tools

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /website
COPY front-code-vue/ front-code-vue
CMD ["nginx", "-g", "daemon off;"]
