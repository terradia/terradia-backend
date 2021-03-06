FROM node:10.15-slim

ENV PATH /app/node_modules/.bin:$PATH

RUN mkdir /app
WORKDIR /app

COPY . /app/

RUN npm install

CMD ["npm", "start"]