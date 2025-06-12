FROM nginx:alpine

COPY docker/nginx.render.conf /etc/nginx/nginx.conf

COPY frontend/ /usr/share/nginx/html/

RUN chmod -R 755 /usr/share/nginx/html
RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/cache/nginx /var/run/nginx.pid /var/log/nginx

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]
