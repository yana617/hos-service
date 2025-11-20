FROM node:22.21.1
LABEL maintainer="jana.ru.sidorova@yandex.by"
ENV NODE_ENV=production PORT=1082

WORKDIR /usr/src/hos-service

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 1082
CMD [ "npm", "start" ]
