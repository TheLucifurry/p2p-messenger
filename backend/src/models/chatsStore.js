const shortUUID = require('short-uuid');

class ChatsStore {
  constructor() {
    this.data = new Map();
  }

  createChat(creatorUserId) {
    const id = shortUUID.generate();
    this.data.set(id, [creatorUserId]);
    return id;
  }

  deleteChat(chatId) {
    this.data.delete(chatId);
  }

  getOwnerId(chatId) {
    return this.data.get(chatId)?.[0];
  }

  isChatHasUser(chatId, userId) {
    const chat = this.data.get(chatId) || [];
    return chat.includes(userId);
  }
}

const chatsStore = new ChatsStore();

module.exports = {
  chatsStore,
};
