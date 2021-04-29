# 基于 node 镜像
FROM node

ADD ./bin/start.sh /etc/start.sh

RUN mkdir /www
WORKDIR /www

ADD package.json /www
RUN npm i

COPY . /www

EXPOSE 9000

CMD ["/bin/bash","/etc/start.sh"]