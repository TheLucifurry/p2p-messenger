const KoaStatic = require('koa-static');

function createStaticServerMiddleware(path, options) {
  const staticServer = KoaStatic(path, options);
  return staticServer;
};

module.exports = {
  createStaticServerMiddleware,
};
