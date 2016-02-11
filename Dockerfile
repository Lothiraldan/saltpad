FROM alpine:3.3
MAINTAINER Alex Leonhardt <aleonhardt.py@gmail.com>
 
RUN mkdir -p /etc/opt/saltpad
VOLUME /etc/opt/saltpad

RUN apk --update add nodejs git

WORKDIR /opt/saltpad
ADD . /opt/saltpad
RUN npm install
RUN ./node_modules/bower/bin/bower install --allow-root
RUN cp settings.json.sample /etc/opt/saltpad/settings.json
RUN ln -sf /etc/opt/saltpad/settings.json ./settings.json
RUN sed -i "s/localhost/0.0.0.0/g" devServer.js

EXPOSE 3333

CMD ["npm", "start"]
