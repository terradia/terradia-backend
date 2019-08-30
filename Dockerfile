FROM node:10.15-slim

ARG NODE_ENV=development

RUN mkdir /app
WORKDIR /app

COPY *.json /app/

EXPOSE 8000

# Set Command
CMD ["npm", "start"]