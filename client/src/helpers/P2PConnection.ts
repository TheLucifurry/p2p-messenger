import { JSONParse } from '@/helpers/JSONParse';

const defaultConfig: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  // sdpSemantics: 'unified-plan', // Is this option deprecated?
};

type SSMessageBody = {
  type: string,
  data: any
}

type SSMessageTypes = 'ICE' | 'OFFER' | 'ANSWER';

type SignalingServerMessage = {
  sender: string,
  body: SSMessageBody
}

// eslint-disable-next-line no-promise-executor-return
const delay = (T: number) => new Promise((_) => setTimeout(_, T));

export function createSignalingServerConnection(
  url: string,
  peerIdReceivedHandler: (peerId: string) => void,
  messageHandler: (message: SignalingServerMessage) => void,
) {
  return new Promise<WebSocket | null>((res) => {
    const ws = new WebSocket(url);

    function interrupt(errorMessage = 'Connection to signaling server failed') {
      const msgPrefix = 'P2PConnection: ';
      if (ws) ws.close();
      console.error(msgPrefix + errorMessage);
      res(null);
    }

    ws.onerror = () => interrupt();

    const timer = setTimeout(() => {
      interrupt('Connection to signaling server timed out');
    }, 3000);

    ws.onopen = () => {
      ws.addEventListener('message', (event) => {
        const peerId = event.data;
        if (typeof peerId !== 'string') {
          interrupt();
          return;
        }

        clearTimeout(timer);

        peerIdReceivedHandler(peerId);

        ws.onmessage = (ev: MessageEvent) => {
          const msg = JSONParse(ev.data) as SignalingServerMessage;
          if (
            msg
            && typeof msg === 'object'
            && typeof msg.sender === 'string'
            && msg.body
            && typeof msg.body.type === 'string'
            && msg.body.data
          ) {
            messageHandler(msg);
          }
        };

        res(ws);
      }, { once: true });
    };
  });
}

enum P2PConnectionState {
  INIT = 0,
  READY_TO_CONNECT = 1,
  CONNECTION_PROCESS = 2,
  CONNECTED = 3,
}

export class P2PConnection {
  static states = P2PConnectionState;

  private ss!: WebSocket; // Signaling server websocket connection

  state: P2PConnectionState = P2PConnectionState.INIT;

  isInitiator: boolean | null = null;

  localPeerId: string | null = null;

  remotePeerId: string | null = null;

  private pc!: RTCPeerConnection;

  private lc!: RTCDataChannel; // Local channel

  private icec: RTCIceCandidate[] = []; // ICE Candidates

  // State INIT
  async init(signalingServerURL: string) {
    await this.connectToSignalingServer(signalingServerURL);
    await this.createRTCConnection();
    this.state = P2PConnectionState.READY_TO_CONNECT;
  }

  private createRTCConnection(config: RTCConfiguration = defaultConfig) {
    if (this.pc) this.pc.close();
    this.pc = new RTCPeerConnection(config);

    // TODO: clean code
    const isClient = false;
    this.lc = this.pc.createDataChannel(isClient ? 'Client' : 'Host');
    this.lc.onclose = () => console.log(`${this.lc.label} channel has CLOSED`);
    this.lc.onopen = () => console.log(`${this.lc.label} channel has OPENED`);

    // TODO: clean code
    //   // Setup ice handling
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('\n\tonicecandidate:');
        console.dir({ icec: event.candidate });
        // this.icec.push(event.candidate);
        this.sendSignal('ICE', event.candidate);
      }
    };

    // return new Promise((res, rej) => {
    const peerId = '(...)';

    //   const timer = setTimeout(() => {
    //     console.log(`iceConnectionState is timed out, closing connections to ${peerId}`);
    //     rej();
    //   }, 5000);

    this.pc.oniceconnectionstatechange = () => {
      // Source: https://github.com/peers/peerjs/blob/cfc37c7988d8ef3d2c1d7b6123562dd2af59defc/lib/negotiator.ts#L84
      switch (this.pc.iceConnectionState) {
        case 'failed':
          console.log(`iceConnectionState is failed, closing connections to ${peerId}`);
          // this.connection.close();
          // rej();
          break;
        case 'closed':
          console.log(`iceConnectionState is closed, closing connections to ${peerId}`);
          // this.connection.close();
          break;
        case 'disconnected':
          console.log(`iceConnectionState changed to disconnected on the connection with ${peerId}`);
          break;
        case 'completed':
          // this.pc.onicecandidate = util.noop;
          console.log('\t[ oniceconnectionstatechange finished ]');
          // clearTimeout(timer);
          // res(null);
          break;
      }

      // this.connection.emit(ConnectionEventType.IceStateChanged, peerConnection.iceConnectionState);
    };
    // });
  }

  private async connectToSignalingServer(url: string) {
    const ss = await createSignalingServerConnection(url, (peerId) => {
      this.localPeerId = peerId;
    }, this.onSSMessageHandler.bind(this));

    if (!ss) {
      throw new Error(`P2PConnection: Failed to connect to signaling server by url "${url}"`);
    }
    this.ss = ss;
  }

  // State READY_TO_CONNECT
  private async makeOffer(): Promise<RTCSessionDescription | null> {
    await this.pc.createOffer()
      .then((description) => this.pc.setLocalDescription(description))
      .catch(console.error); // TODO: Improve exception handling

    return this.pc.localDescription;
  }

  private sendSignal(type: SSMessageTypes, data: any) {
    const message = {
      target: this.remotePeerId,
      body: { type, data },
    };
    if (this.state !== P2PConnectionState.READY_TO_CONNECT) {
      throw new Error('P2PConnection: Not ready to connect'); // TODO: normalize exceptions handling
    }
    this.ss.send(JSON.stringify(message));
  }

  private async onSSMessageHandler(message: SignalingServerMessage) {
    const { type, data } = message.body;

    if (this.remotePeerId !== null && message.sender !== this.remotePeerId) {
      console.error(`P2PConnection: Received signal message from unexpected peer "${message.sender}"`);
      return;
    }

    if (this.isInitiator === null) return;

    switch (type) {
      case 'ICE': { // Initiator receives from Listener
        const candidate = data;
        console.log('onSSMessageHandler received ICE signal:');
        console.dir({ candidate });
        this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        break;
      }
      case 'OFFER': { // Initiator receives from Listener
        const offer = data;
        const sender = message.sender;
        this.remotePeerId = sender;
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        if (answer === null) {
          console.error('P2PConnection: Error');
          return;
        }
        this.sendSignal('ANSWER', answer);
        break;
      }
      case 'ANSWER': { // Listener receives from Initiator
        const sdp = data;
        this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        break;
      }
    }
  }

  // State CONNECTION_PROCESS
  async connect(remotePeerId: string) {
    if (this.state !== P2PConnectionState.READY_TO_CONNECT) {
      throw new Error('P2PConnection: Not ready to connect'); // TODO: normalize exceptions handling
    }
    this.isInitiator = true;
    this.remotePeerId = remotePeerId;
    const offer = await this.makeOffer();
    if (!offer) {
      throw new Error('P2PConnection: Can\'t make offer'); // TODO: normalize exceptions handling
    }
    console.log('\tawait ICE condidated handling...');
    await delay(2000);

    console.log('\tsend offer');
    this.sendSignal('OFFER', offer);

    // console.log('ICE Candidates:');
    // console.dir(this.icec);
    // this.sendSignal('ICE', this.icec[0]);

    // TODO: make rejecting by timer
  }

  async listen() {
    if (this.state !== P2PConnectionState.READY_TO_CONNECT) {
      throw new Error('P2PConnection: Not ready to connect'); // TODO: normalize exceptions handling
    }
    this.isInitiator = false;
  }

  // State CONNECTED
  send(type: string, data: any) {
    const message = { type, data };
    this.lc.send(JSON.stringify(message));
  }

  onMessage<Context>(callback: (this: Context, type: string, data: any)=>void, context: Context) {
    this.pc.ondatachannel = (event) => {
      const remoteChannel = event.channel;
      // remoteChannel.onopen = () => console.log('Remote channel has OPENED');
      // remoteChannel.onclose = () => console.log('Remote channel has CLOSED');
      remoteChannel.onmessage = (e) => {
        const message = JSONParse(e.data);
        if (typeof message.type !== 'string' || !message.data) {
          console.error(`P2PConnection: received incorrect message from peer "${this.remotePeerId}"`);
          return;
        }
        callback.call(context, message.type, message.data);
      };
    };
  }
}
