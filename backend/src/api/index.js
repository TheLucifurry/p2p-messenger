const { chatsStore } = require('../models/chatsStore');

async function createAPI(route) {

  route.get('/chat/create/:peerId', async (request, reply) => {
    const { peerId } = request.params
    const chatId = await chatsStore.createChat(peerId);
    reply.send({ chatId });
  });

  route.get('/chat/join/:chatId/:peerId', async (request, reply) => {
    const { chatId, peerId } = request.params;
    if (chatsStore.isChatHasPeer(chatId, peerId)) {
      reply.send({ peerId: null });
      return;
    }
    const chatAdminPeerId = chatsStore.getOwnerId(chatId);
    reply.send({ peerId: chatAdminPeerId });
  });

}

module.exports = createAPI;
