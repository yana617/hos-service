FROM node:18.20.4
LABEL maintainer="jana.ru.sidorova@yandex.ru"
ENV NODE_ENV=production PORT=1082

WORKDIR /usr/src/hos-service

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 1082
CMD [ "npm", "start" ]
