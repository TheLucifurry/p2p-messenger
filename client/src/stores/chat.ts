import { defineStore } from 'pinia';
import { ChatMsg, ChatMsgData, EMsgType } from '@/types/messages';
import { getDateTimeNowAsString } from '@/helpers/datetime';
import API from '@/api';
import { createChatURL, parseChatFromURL } from '@/helpers/URL';
import { RTCController } from '@/helpers/RTCController';

type State = {
  userId: string | null
  chatId: string | null
  chatAdminUserId: string | null
  rtcc: RTCController
  messages: ChatMsg[]
}

function createChatMessage(type: EMsgType, data: ChatMsgData): ChatMsg {
  return {
    type,
    data,
    time: getDateTimeNowAsString(),
  };
}

export const useStoreChat = defineStore('partitura', {
  state: () => ({
    userId: null,
    chatId: null,
    rtcc: new RTCController(),
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
      const peerId = await API.chat.socketSetup();
      if (peerId === null) return;
      this.userId = peerId;

      const connectToChatId = parseChatFromURL(location.href);
      if (connectToChatId) {
        this.chatId = connectToChatId;
        this.rtcc.init(undefined, true);
        this.joinChat(connectToChatId);
      } else {
        this.rtcc.init();
        this.createChat(this.userId);
      }

      // !DEBUG
      // @ts-ignore
      window.RTCC = this.rtcc;
    },
    async createChat(creatorUserId: string) {
      this.chatId = await API.chat.create(creatorUserId);
      console.log(`\tCreated chat id: ${this.chatId}`);

      API.chat.onReadyToOffer(async (fromUser) => {
        const offer = await this.rtcc.makeOffer();
        if (offer === null) return;
        API.chat.sendOffer(fromUser, offer);
        API.chat.onAnswer((answer) => {
          this.rtcc.receiveAnswer(answer);

          this.rtcc.sendMessage('Hello P2P!');
        });
      });
    },
    async joinChat(chatId: string) {
      this.chatAdminUserId = await API.chat.join(chatId);
      API.chat.onOffer(async (offer) => {
        const answer = await this.rtcc.handleOffer(offer);
        if (answer === null) return;
        API.chat.sendAnswer(this.chatId as string, offer);
      });
      // API.chat.socketClose();
    },
    addUserMessage(msgText: string) {
      this.messages.push(
        createChatMessage(EMsgType.OUT, msgText),
      );
    },
  },
});
