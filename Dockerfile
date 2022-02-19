FROM node:16 AS build_client

COPY ./client/package*.json ./client/
RUN cd ./client && npm i

COPY ./client/. ./client/
RUN cd ./client && npm run build


FROM node:16

WORKDIR /app

COPY --from=build_client /public ./public

COPY ./backend/package*.json ./backend/
RUN cd ./backend && npm i --only=prod

COPY ./backend/. ./backend

EXPOSE 8080

ENV PORT=8080
ENV MODE='PROD'

CMD [ "node", "backend/src/index.js" ]
