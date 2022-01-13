import { defineStore } from 'pinia';
import { ChatMsg, ChatMsgData, EMsgType } from '@/types/messages';
import { getDateTimeNowAsString } from '@/helpers/datetime';

type State = {
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
      {
        type: EMsgType.EVENT,
        time: getDateTimeNowAsString(),
        data: 0,
      },
      {
        type: EMsgType.IN,
        time: getDateTimeNowAsString(),
        data: 'Who auent/Shaont-size: 28px; margin-right: 14px">\n<n-icon>npx; marght: 14px"renpx; margiType.n-Type.righin-right: 14px"renpx; marginType.-right: 14px"Anpx; margin-right: 14px">\n<n-icondre you?',
      },
      {
        type: EMsgType.OUT,
        time: getDateTimeNowAsString(),
        data: 'Who auent/Shaont-size: 28px; margin-right: 14px">\n<n-icon>npx; marght: 14px"renpx; margiType.n-Type.righin-right: 14px"renpx; marginType.-right: 14px"Anpx; margin-right: 14px">\n<n-icondre you?',
      },
    ],
  } as State),
  getters: {
    getMessages: (state) => state.messages,
  },
  actions: {
    addUserMessage(msgText: string) {
      this.messages.push(
        createChatMessage(EMsgType.OUT, msgText),
      );
    },
  },
});
