const chat = {
  create(peerId: string): Promise<string | null> {
    return fetch(`./api/chat/create/${peerId}`)
      .then((d) => d.json())
      .then((d) => d.chatId)
      .catch(() => null);
  },
  join(chatId: string, peerId: string): Promise<string | null> {
    return fetch(`./api/chat/join/${chatId}/${peerId}`)
      .then((d) => d.json())
      .then((d) => d.peerId)
      .catch(() => null);
  },
};

export default {
  chat,
};
