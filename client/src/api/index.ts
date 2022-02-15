import { JSONParse } from '@/helpers/JSONParse';
import { createSocketConnection } from '@/helpers/webSocket';

type MsgOutTypes = 'CREATE_CHAT' | 'JOIN_CHAT' | 'SIGNAL_ICE' | 'SIGNAL_OFFER' | 'SIGNAL_ANSWER';
type MsgInTypes = 'RESULT' | 'READY_TO_OFFER' | 'SIGNAL_ICE' | 'SIGNAL_OFFER' | 'SIGNAL_ANSWER';

type SocketMessageHandlerOptions = {
  once?: boolean
  handler: (data: any) => void
}

const chat = {
  _ws: null as WebSocket | null,
  _msgh: new Map<MsgInTypes, SocketMessageHandlerOptions>(),
  async socketSetup(): Promise<string | null> {
    const ws = await createSocketConnection(`ws://${location.host}/signaling/`, (event) => {
      const { type, data } = JSONParse(event?.data, {}) as { type: MsgInTypes, data: any };
      console.log(`\nReceived message "${type}":`);
      console.dir(data);
      if (typeof type !== 'string' || data == null) return;
      const handlerData = this._msgh.get(type);
      if (handlerData && typeof handlerData.handler === 'function') {
        handlerData.handler(data);
        if (handlerData.once) {
          this._msgh.delete(type);
        }
      }
    });
    chat._ws = ws;

    return new Promise((res) => {
      this.socketOnMessage('RESULT', {
        once: true,
        handler: (peerId) => res(peerId || null),
      });
    });
  },
  socketClose() {
    chat._ws = null;
  },
  socketSendMessage(type: MsgOutTypes, data: any) {
    if (!chat._ws) {
      console.error('WebSocket connection unreachable');
      return;
    }
    console.log(`\nSent message "${type}":`);
    console.dir(data);
    chat._ws.send(JSON.stringify({ type, data }));
  },
  socketOnMessage(type: MsgInTypes, options: SocketMessageHandlerOptions) {
    this._msgh.set(type, options);
  },

  create(peerId: string): Promise<string | null> {
    return fetch(`./api/chat/create/${peerId}`)
      .then((d) => d.json())
      .then((d) => d.chatId)
      .catch(() => null);
    // return new Promise((res) => {
    //   this.socketSendMessage('CREATE_CHAT', { peerId });
    //   this.socketOnMessage('RESULT', {
    //     once: true,
    //     handler: (chatid) => res(chatid || null),
    //   });
    // });
  },
  join(chatId: string, peerId: string): Promise<string | null> {
    return fetch(`./api/chat/join/${chatId}/${peerId}`)
      .then((d) => d.json())
      .then((d) => d.peerId)
      .catch(() => null);
    // return new Promise((res) => {
    //   this.socketSendMessage('JOIN_CHAT', { chatid });
    //   this.socketOnMessage('RESULT', {
    //     once: true,
    //     handler: (chatAdminUserId) => res(chatAdminUserId || null),
    //   });
    // });
  },
  onReadyToOffer(handler: (fromUserId: string) => void) {
    this._msgh.set('READY_TO_OFFER', { once: true, handler });
  },
  sendOffer(toUser: string, offer: RTCSessionDescription) {
    this.socketSendMessage('SIGNAL_OFFER', { peerId: toUser, sdp: offer });
  },
  onOffer(handler: (offer: RTCSessionDescription) => void) {
    this._msgh.set('SIGNAL_OFFER', { once: true, handler });
  },
  sendAnswer(toAdminOfChat: string, answer: RTCSessionDescription) {
    this.socketSendMessage('SIGNAL_ANSWER', { chatid: toAdminOfChat, sdp: answer });
  },
  onAnswer(handler: (answer: RTCSessionDescription) => void) {
    this._msgh.set('SIGNAL_ANSWER', { once: true, handler });
  },
};

export default {
  chat,
};
