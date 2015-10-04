FROM ubuntu

RUN mkdir /tmp/deploy

WORKDIR /tmp/deploy

RUN apt-get update && apt-get install -y \
    python gcc g++ make pkg-config build-essential \
    curl wget git supervisor \
    protobuf-compiler libprotobuf-dev libcurl4-openssl-dev \
    libboost-all-dev libncurses5-dev libjemalloc-dev m4

RUN rm -rf /var/lib/apt/lists/* \
&&  sed -i 's/^\(\[supervisord\]\)$/\1\nnodaemon=true/' /etc/supervisor/supervisord.conf \
&&  update-rc.d supervisor defaults

RUN wget https://nodejs.org/dist/v4.1.1/node-v4.1.1.tar.gz \
&&  tar -xvf node-v4.1.1.tar.gz 

RUN cd node-v4.1.1/ && ./configure && make && make install

RUN curl -s https://raw.githubusercontent.com/lovell/sharp/master/preinstall.sh | bash -

RUN wget http://download.rethinkdb.com/dist/rethinkdb-2.1.4.tgz \
&&  tar xf rethinkdb-2.1.4.tgz \
&&  cd rethinkdb-2.1.4/ && ./configure --allow-fetch && make && make install

WORKDIR /root

RUN git clone https://github.com/c9/core.git ./cloud9 \
&&  cloud9/scripts/install-sdk.sh \
&&  sed -i -e 's_127.0.0.1_0.0.0.0_g' cloud9/configs/standalone.js

RUN git clone https://github.com/AquestTechnologies/Aquest.git ./aquest \
&&  cd aquest/ && npm i && npm i -g nodemon babel

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD ./rethinkdb.conf /etc/supervisor/conf.d/
ADD ./cloud9.conf /etc/supervisor/conf.d/

EXPOSE 80 81 82 83 8080 29015 28015

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
