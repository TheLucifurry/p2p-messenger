FROM node:16.13.2

WORKDIR /app

COPY ./backend/package*.json ./backend/
RUN cd ./backend && npm i

COPY ./client/package*.json ./client/
RUN cd ./client && npm i

COPY ./backend/. ./backend/

COPY ./client/. ./client/
RUN cd ./client && npm run build

EXPOSE 8080

ENV PORT=8080

CMD [ "node", "backend/src/index.js" ]