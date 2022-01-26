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
}

const chatsStore = new ChatsStore();

module.exports = {
  chatsStore,
};
