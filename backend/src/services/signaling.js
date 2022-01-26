const isWSMessage = require('../schemas/isWSMessage');
const JSONParse = require('../utils/JSONParse');
const { chatsStore } = require('../models/chatsStore');
const { usersStore } = require('../models/usersStore');

function sendToUser(userId, data) {
  const wsContext = usersStore.get(userId);
  if (!wsContext) return false;
  wsContext.websocket.send(JSON.stringify(data));
  return true;
}

function createSignalingServerMiddleware(options = {}) {
  return (ctx) => {
    const userid = createUser(ctx);

    console.log('ctx:');
    console.dir(ctx.websocket.send);
    ctx.websocket.send('Uoy connected')

    setTimeout(() => {
      ctx.websocket.send('...after 3s...')
    }, 3000)

    console.log('\tUser created: ' + userid);

    ctx.websocket.on('message', (message) => {
      const msg = JSONParse(message);

      console.log('msg:');
      console.table(msg);

      if (!msg || !isWSMessage(msg)) return;

      switch (msg.type) {
        case 'JOIN_CHAT': {
          const { data } = msg;
          const chatOwnerUserid = chatsStore.get(data.chatid)?.[0];
          sendToUser(chatOwnerUserid, { type: 'READY_TO_OFFER', data: userid });
          break;
        }

        case 'SIGNAL_OFFER': {
          const { data } = msg;
          sendToUser(data.userid, { type: 'SIGNAL_OFFER', data });
          break;
        }

        case 'SIGNAL_ANSWER': {
          const { data } = msg;
          sendToUser(data.userid, { type: 'SIGNAL_ANSWER', data });
          break;
        }
      }
      // do something
      console.table(msg);
    });

    // ctx.websocket.on('close', () => {
    //   deleteUser(userid);
    //   console.log('\tUser deleted: ' + userid);
    // });
  };
};

module.exports = {
  createSignalingServerMiddleware,
};
