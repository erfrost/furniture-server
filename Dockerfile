FROM node:19.6.0

WORKDIR /app

COPY ./package.json /app

RUN npm install

COPY . /app

EXPOSE 8080

CMD [ "npm", "run", "start" ]