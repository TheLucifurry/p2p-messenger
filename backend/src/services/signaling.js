const isWSMessage = require('../schemas/isWSMessage');
const JSONParse = require('../utils/JSONParse');
const { peersStore } = require('../models/peersStore');

function sendToPeer(peerId, data) {
  const conn = peersStore.get(peerId);
  if (!conn) return false;
  conn.socket.send(JSON.stringify(data));
  return true;
}

async function signalingServer(app) {
  app.get('/', { websocket: true }, (conn, req) => {
    const currentPeerId = peersStore.create(conn);

    conn.socket.send(currentPeerId);

    conn.socket.on('message', (message) => {
      const msg = JSONParse(message);
      if (!msg || !isWSMessage(msg)) return;

      sendToPeer(msg.target, {
        body: msg.body,
        sender: currentPeerId,
      });
    });

    // TODO: useless peers cleaning
    // ctx.websocket.on('close', () => {
    //   deleteUser(userid);
    //   console.log('\tUser deleted: ' + userid);
    // });
  })
}

module.exports = signalingServer;
