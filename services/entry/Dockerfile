FROM debian:latest

LABEL org.opencontainers.image.source https://github.com/husky-dev/smartapp-api

RUN apt-get update \
  && apt-get install -y wget build-essential zlib1g-dev libpcre3 libpcre3-dev libbz2-dev libssl-dev \
  && addgroup --system --gid 101 nginx \
  && adduser --system --disabled-login --ingroup nginx --no-create-home --home /nonexistent --gecos "nginx user" --shell /bin/false --uid 101 nginx \
  \
  && wget https://nginx.org/download/nginx-1.21.4.tar.gz \
  && tar -zxf nginx-1.21.4.tar.gz \
  && rm -rf /nginx-1.21.4.tar.gz \
  && wget https://people.freebsd.org/\~osa/ngx_http_redis-0.3.9.tar.gz \
  && tar -zxf ngx_http_redis-0.3.9.tar.gz \
  && rm -rf ngx_http_redis-0.3.9.tar.gz \
  && cd nginx-1.21.4 \
  \
  && ./configure \
  --user=nginx                          \
  --group=nginx                         \
  --prefix=/etc/nginx                   \
  --sbin-path=/usr/sbin/nginx           \
  --conf-path=/etc/nginx/nginx.conf     \
  --pid-path=/var/run/nginx.pid         \
  --lock-path=/var/run/nginx.lock       \
  --error-log-path=/var/log/nginx/error.log \
  --http-log-path=/var/log/nginx/access.log \
  --with-http_gzip_static_module        \
  --with-http_stub_status_module        \
  --with-http_ssl_module                \
  --with-pcre                           \
  --with-file-aio                       \
  --with-http_realip_module             \
  --without-http_scgi_module            \
  --without-http_uwsgi_module           \
  --without-http_fastcgi_module         \
  --add-dynamic-module=/ngx_http_redis-0.3.9 \
  && make \
  && make install \
  \
  && rm -rf /nginx-1.21.4 \
  && rm -rf /ngx_http_redis-0.3.9

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

STOPSIGNAL SIGQUIT

CMD ["nginx", "-g", "daemon off;"]

COPY conf/production /etc/nginx/conf.d
