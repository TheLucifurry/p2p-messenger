const path = require('path');
const Koa = require('koa');
// const koaBody = require('koa-body');
const Config = require('./config');
const { createStaticServerMiddleware } = require('./services/static');
const { createSignalingServerMiddleware } = require('./services/signaling');
// const { createAPI } = require('./api/index');
const koaWebsocket = require('koa-websocket');

const app = koaWebsocket(new Koa());

app.ws.use(
  createSignalingServerMiddleware(),
);

app.use(
  createStaticServerMiddleware(path.resolve(Config.STATIC_FILES_DIR), { maxage: 3600 * 6 }),
);

// app.use(koaBody());

// app.use(
//   createAPI(),
// );

app.listen(Config.PORT, () => {
  console.log(`\t[ App listening on port ${Config.PORT} ]`);
});
