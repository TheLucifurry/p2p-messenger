const isWSMessage = require('../schemas/isWSMessage');
const JSONParse = require('../utils/JSONParse');
const { chatsStore } = require('../models/chatsStore');
const { usersStore } = require('../models/usersStore');

function sendToUser(userId, data) {
  const conn = usersStore.getUser(userId);
  if (!conn) return false;
  conn.socket.send(JSON.stringify(data));
  return true;
}

async function signalingServer(app, options) {
  app.get('/', { websocket: true }, (conn, req) => {
    const currentUserid = usersStore.createUser(conn);

    sendToUser(currentUserid, { type: 'RESULT', data: currentUserid });

    conn.socket.on('message', (message) => {
      const msg = JSONParse(message);

      // console.log('msg:');
      // console.table(msg);

      if (!msg || !isWSMessage(msg)) return;

      switch (msg.type) {
        case 'CREATE_CHAT': { // Client 1 -> Signaling server
          const { userid } = msg.data;
          const chatid = chatsStore.createChat(userid);
          sendToUser(currentUserid, { type: 'RESULT', data: chatid });
          break;
        }

        case 'JOIN_CHAT': { // 2 -> SS -> 1
          const { chatid } = msg.data;
          if (!chatsStore.isChatHasUser(chatid, currentUserid)) {
            const chatOwnerUserid = chatsStore.getOwnerId(chatid);
            sendToUser(chatOwnerUserid, { type: 'READY_TO_OFFER', data: currentUserid });
            sendToUser(currentUserid, { type: 'RESULT', data: chatOwnerUserid });
          }
          break;
        }

        case 'SIGNAL_ICE': { // 1 -> SS -> 2 and back
          const { toUserid, ice } = msg.data;
          sendToUser(toUserid, {
            type: 'SIGNAL_ICE',
            data: {
              fromUserid: currentUserid,
              ice,
            },
          });
          break;
        }

        case 'SIGNAL_OFFER': { // 1 -> SS -> 2
          const { userid, sdp } = msg.data;
          sendToUser(userid, { type: 'SIGNAL_OFFER', data: sdp });
          break;
        }

        case 'SIGNAL_ANSWER': { // 2 -> SS -> 1
          const { chatid, sdp } = msg.data;
          const chatOwnerUserid = chatsStore.getOwnerId(chatid);
          sendToUser(chatOwnerUserid, { type: 'SIGNAL_ANSWER', data: sdp });
          break;
        }
      }
    });

    // ctx.websocket.on('close', () => {
    //   deleteUser(userid);
    //   console.log('\tUser deleted: ' + userid);
    // });
  })
}

module.exports = signalingServer;
