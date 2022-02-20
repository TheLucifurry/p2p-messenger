import { defineStore } from 'pinia';
import { useMessage } from 'naive-ui';
import { ChatMsg, ChatMsgData } from '@/types/messages';
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

function createChatMessage(sender: string | null, data: ChatMsgData): ChatMsg {
  return {
    sender,
    data,
    time: getDateTimeNowAsString(),
  };
}

const isDevMode = process.env.NODE_ENV === 'development';

export const useStoreChat = defineStore('chat', {
  state: () => ({
    userId: null,
    chatId: null,
    p2pc: new P2PConnection(),
    messages: [],
  } as State),
  getters: {
    getMessages: (state) => state.messages,
    getChatURL: (state) => (state.chatId ? createChatURL(state.chatId, location.origin) : null),
  },
  actions: {
    async pageLoaded() {
      try {
        await this.p2pc.init(`ws${isDevMode ? '' : 's'}://${location.host}/signaling/`);
      } catch (error: any) {
        window.$message.error(error.message);
      }

      const peerId = this.p2pc.localPeerId;

      if (!peerId) {
        window.$message.error('Can\'t start, no peerId');
        return;
      }

      const connectToChatId = parseChatFromURL(location.href);
      if (connectToChatId) {
        this.chatId = connectToChatId;
        this.joinChat(connectToChatId);
      } else {
        this.createChat(peerId);
      }

      this.p2pc.onMessage((type, data) => {
        switch (type) {
          case 'CHAT_MSG': {
            this.receiveChatMessage(data);
            break;
          }
        }
      }, this);

      // !DEBUG
      // @ts-ignore
      window.P2PC = this.p2pc;
    },
    async createChat(creatorUserId: string) {
      this.chatId = await API.chat.create(creatorUserId);
      window.$message.info('Chat created.\nShare link to it with another user via "share" button');

      await this.p2pc.listen();
      this.sendChatMessage('You have created the chat', true);
    },
    async joinChat(chatId: string) {
      const chatAdminPeerId = await API.chat.join(chatId, this.p2pc.localPeerId as string);
      if (!chatAdminPeerId) {
        window.$message.error('Chat admin\'s peer ID wasn\'t received after trying to join the chat');
        return;
      }
      await this.p2pc.connect(chatAdminPeerId);
      this.sendChatMessage('You have joined the chat', true);
    },

    sendChatMessage(msgText: string, isThirdParty = false) {
      const msg: ChatMsg = createChatMessage(isThirdParty ? null : this.p2pc.localPeerId, msgText);
      this.messages.push(msg);
      this.p2pc.send('CHAT_MSG', msg);
    },

    receiveChatMessage(msg: ChatMsg) {
      this.messages.push(msg);
    },
  },
});
