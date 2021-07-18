FROM node:14.17.0
LABEL maintainer="jana.ru.sidorova@yandex.ru"
ENV NODE_ENV=production PORT=1082

WORKDIR /usr/src/hos-serive

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 1082
CMD [ "npm", "start" ]