FROM ubuntu

RUN echo "Rock'n'Roll"

RUN mkdir /tmp/deploy

WORKDIR /tmp/deploy

RUN apt-get update && apt-get install -y git wget python gcc g++ make

RUN wget http://zlib.net/zlib-1.2.8.tar.gz
RUN wget https://nodejs.org/dist/v4.1.1/node-v4.1.1.tar.gz
RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/GraphicsMagick-LATEST.tar.gz
RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/delegates/jpegsrc.v9a.tar.gz
RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/delegates/libpng-1.6.18.tar.gz

RUN tar -xvf zlib-1.2.8.tar.gz
RUN tar -xvf node-v4.1.1.tar.gz 
RUN tar -xvf jpegsrc.v9a.tar.gz
RUN tar -xvf libpng-1.6.18.tar.gz
RUN tar -xvf GraphicsMagick-LATEST.tar.gz

RUN cd node-v4.1.1/ && ./configure && make && sudo make install
RUN cd zlib-* && ./configure && make && sudo make install
RUN cd jpeg-* && ./configure && make && sudo make install
RUN cd libpng-* && ./configure && make && sudo make install
RUN cd GraphicsMagick-* && ./configure && make && sudo make install

RUN sudo ranlib /usr/local/lib/libjpeg.a && sudo ldconfig /usr/local/lib

RUN mkdir /srv/aquest && git clone https://github.com/AquestTechnologies/Aquest.git /srv/aquest

WORKDIR /srv/aquest

RUN npm i && npm i -g nodemon babel
