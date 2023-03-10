FROM node:18-alpine as builder

WORKDIR /app
COPY ./package*.json ./ 
RUN npm install
COPY . .
RUN npm install --global nodemon

EXPOSE 8080
