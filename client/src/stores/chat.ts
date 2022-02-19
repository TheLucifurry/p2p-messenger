import { defineStore } from 'pinia';
import { ChatMsg, ChatMsgData, EMsgType } from '@/types/messages';
import { getDateTimeNowAsString } from '@/helpers/datetime';
import API from '@/api';
import { createChatURL, parseChatFromURL } from '@/helpers/URL';
import { P2PConnection } from '@/helpers/P2PConnection';

type State = {
  userId: string | null
  chatId: string | null
  p2pc: P2PConnection
  messages: ChatMsg[]
}

function createChatMessage(type: EMsgType, data: ChatMsgData): ChatMsg {
  return {
    type,
    data,
    time: getDateTimeNowAsString(),
  };
}

export const useStoreChat = defineStore('chat', {
  state: () => ({
    userId: null,
    chatId: null,
    p2pc: new P2PConnection(),
    messages: [
      {
        type: EMsgType.EVENT,
        time: getDateTimeNowAsString(),
        data: 0,
      },
      {
        type: EMsgType.OUT,
        time: getDateTimeNowAsString(),
        data: 'Hello WebRTC!',
      },
      {
        type: EMsgType.IN,
        time: getDateTimeNowAsString(),
        data: 'Who are you?',
      },
    ],
  } as State),
  getters: {
    getMessages: (state) => state.messages,
    getChatURL: (state) => (state.chatId ? createChatURL(state.chatId, location.origin) : null),
  },
  actions: {
    async pageLoaded() {
      await this.p2pc.init(`ws://${location.host}/signaling/`);

      const peerId = this.p2pc.localPeerId;

      if (!peerId) {
        console.error('Can\'t start, no peerId');
        return;
      }

      const connectToChatId = parseChatFromURL(location.href);
      if (connectToChatId) {
        this.chatId = connectToChatId;
        this.joinChat(connectToChatId);
      } else {
        this.createChat(peerId);
      }

      // !DEBUG
      // @ts-ignore
      window.P2PC = this.p2pc;
    },
    async createChat(creatorUserId: string) {
      this.chatId = await API.chat.create(creatorUserId);
      console.log(`\tCreated chat id: ${this.chatId}`);

      this.p2pc.listen();
    },
    async joinChat(chatId: string) {
      const chatAdminPeerId = await API.chat.join(chatId, this.p2pc.localPeerId as string);
      if (!chatAdminPeerId) {
        console.error('Chat admin\'s peer ID wasn\'t received after trying to join the chat');
        return;
      }
      this.p2pc.connect(chatAdminPeerId);
    },

    addUserMessage(msgText: string) {
      this.messages.push(
        createChatMessage(EMsgType.OUT, msgText),
      );
    },
  },
});
