FROM nginx:alpine
COPY index.html style.css /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
EXPOSE 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
