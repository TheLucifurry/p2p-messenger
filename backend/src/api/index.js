const { chatsStore } = require('../models/chatsStore');
const JSONParse = require('../utils/JSONParse');
const Koa = require('koa');

function createAPI() {
  /**
   * @param {Koa.Context} ctx
   */
  return async (ctx) => {
    const body = ctx.request.body;

    switch (ctx.url) {
      case '/chat/create':
        if (body?.userid) {
          const chatid = await chatsStore.createChat(body.userid);
          ctx.status = 200;
          ctx.body = JSON.stringify({ chatid });
        }
        break;

      default:
        ctx.status = 404;
        break;
    }
  };
}

module.exports = {
  createAPI
};
