# 基于 node 镜像

FROM node
RUN rm -rf /www
RUN mkdir /www
WORKDIR /www

COPY . /www
RUN npm install
RUN npm i -g pm2
EXPOSE 9000
CMD pm2 start bin/init.js --name web-monitoring/backend_server_docker --no-daemon