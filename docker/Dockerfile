FROM ubuntu:14.04

WORKDIR /tmp

RUN apt-get update && apt-get install -y \
    python gcc g++ make curl wget git supervisor \
    build-essential protobuf-compiler \
    libprotobuf-dev libcurl4-openssl-dev \
    libboost-all-dev libncurses5-dev \
    libjemalloc-dev m4

RUN rm -rf /var/lib/apt/lists/* \
&&  sed -i 's/^\(\[supervisord\]\)$/\1\nnodaemon=true/' /etc/supervisor/supervisord.conf \
&&  update-rc.d supervisor defaults

RUN wget https://nodejs.org/dist/v4.1.1/node-v4.1.1.tar.gz \
&&  tar -xvf node-v4.1.1.tar.gz \
&&  cd node-v4.1.1/ && ./configure && make && make install

RUN wget http://download.rethinkdb.com/dist/rethinkdb-2.1.4.tgz \
&&  tar xf rethinkdb-2.1.4.tgz \
&&  cd rethinkdb-2.1.4/ && ./configure --allow-fetch && make && make install

RUN wget http://zlib.net/zlib-1.2.8.tar.gz \
&&  tar -xvf zlib-1.2.8.tar.gz \
&&  cd zlib-* && ./configure && make && make install

RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/delegates/jpegsrc.v9a.tar.gz \
&&  tar -xvf jpegsrc.v9a.tar.gz \
&&  cd jpeg-* && ./configure && make && make install

RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/delegates/libpng-1.6.18.tar.gz \
&&  tar -xvf libpng-1.6.18.tar.gz \
&&  cd libpng-* && ./configure && make && make install

RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/GraphicsMagick-LATEST.tar.gz \
&&  tar -xvf GraphicsMagick-LATEST.tar.gz \
&&  cd GraphicsMagick-* && ./configure && make && make install \
&&  ranlib /usr/local/lib/libjpeg.a && ldconfig /usr/local/lib

WORKDIR /root

RUN git clone https://github.com/c9/core.git ./cloud9 \
&&  cd cloud9/ && scripts/install-sdk.sh \
&&  sed -i -e 's_127.0.0.1_0.0.0.0_g' configs/standalone.js

RUN git clone https://github.com/AquestTechnologies/Aquest.git ./aquest \
&&  cd aquest/ && npm i && npm i -g nodemon babel

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD ./config/* /etc/supervisor/conf.d/

EXPOSE 80 81 3000 8080 9090 29015 28015

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
