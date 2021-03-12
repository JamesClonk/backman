FROM ubuntu:20.04

ARG package_args='--allow-downgrades --allow-remove-essential --allow-change-held-packages --no-install-recommends'
RUN echo "debconf debconf/frontend select noninteractive" | debconf-set-selections && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get -y $package_args update && \
  apt-get -y $package_args dist-upgrade && \
  apt-get -y $package_args install curl ca-certificates gnupg tzdata golang git

WORKDIR /go/src/github.com/swisscom/backman
COPY . .
RUN go build -o backman

FROM ubuntu:20.04
LABEL maintainer="JamesClonk <jamesclonk@jamesclonk.ch>"

ARG package_args='--allow-downgrades --allow-remove-essential --allow-change-held-packages --no-install-recommends'
RUN echo "debconf debconf/frontend select noninteractive" | debconf-set-selections && \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get -y $package_args update && \
  apt-get -y $package_args dist-upgrade && \
  apt-get -y $package_args install curl ca-certificates gnupg tzdata

RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
  curl https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
  echo "deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
  echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" > /etc/apt/sources.list.d/mongodb-org-4.4.list
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get -y $package_args update && \
  apt-get -y $package_args install mysql-client postgresql-client-12 mongodb-org-tools=4.4.0 mongodb-org-shell=4.4.0 redis-tools nodejs openssh-server bash vim && \
  apt-get clean && \
  find /usr/share/doc/*/* ! -name copyright | xargs rm -rf && \
  rm -rf \
  /usr/share/man/* /usr/share/info/* \
  /var/lib/apt/lists/* /tmp/*
RUN npm install elasticdump -g

RUN mongorestore --version

RUN useradd -u 2000 -mU -s /bin/bash vcap && \
  mkdir /home/vcap/app && \
  chown vcap:vcap /home/vcap/app

WORKDIR /home/vcap/app
#COPY backman ./
COPY public ./public/
COPY static ./static/
COPY --from=0 /go/src/github.com/swisscom/backman/backman ./backman

RUN chmod +x /home/vcap/app/backman
RUN chown -R vcap:vcap /home/vcap/app
USER vcap

EXPOSE 8080

CMD ["./backman"]
