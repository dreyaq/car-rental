FROM nginx:alpine

COPY docker/nginx.prod.conf /etc/nginx/nginx.conf

COPY frontend/ /usr/share/nginx/html/

RUN adduser -D -s /bin/sh appuser

RUN chown -R appuser:appuser /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
