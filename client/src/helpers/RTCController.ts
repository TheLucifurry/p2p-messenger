const defaultConfig: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

// ? Based on example http://richard.to/programming/webrtc-signaling-example.html
export class RTCController {
  private pc!: RTCPeerConnection;

  private lc!: RTCDataChannel; // Local channel

  // private localSDP: RTCSessionDescription | null = null; // NOTE: Potential problems with multi-connection

  // private remoteSDP: RTCSessionDescription | null = null; // NOTE: Potential problems with multi-connection

  init(config: RTCConfiguration = defaultConfig, isClient = false) {
    if (this.pc) this.pc.close();
    this.pc = new RTCPeerConnection(config);

    this.lc = this.pc.createDataChannel(isClient ? 'Client' : 'Host');
    this.lc.onclose = () => console.log(`${this.lc.label} channel has OPENED`);
    this.lc.onopen = () => console.log(`${this.lc.label} Host channel has CLOSED`);

    //   // Setup ice handling
    //   yourConn.onicecandidate = function (event) {
    //     if (event.candidate) {
    //        send({
    //           type: "candidate",
    //           candidate: event.candidate
    //        });
    //     }
    //  };
    /// ???
    this.pc.ondatachannel = (event) => {
      const remoteChannel = event.channel;
      remoteChannel.onopen = () => console.log('Remote channel has OPENED');
      remoteChannel.onclose = () => console.log('Remote channel has CLOSED');
      remoteChannel.onmessage = (e) => console.log(`Message from DataChannel '${remoteChannel.label}' payload '${e.data}'`);
    };
  }

  async makeOffer(): Promise<RTCSessionDescription | null> {
    await this.pc.createOffer()
      .then((description) => this.pc.setLocalDescription(description))
      .catch(console.error); // TODO: Improve exception handling

    return new Promise((res) => {
      this.pc.onicecandidate = (event) => {
        if (event.candidate !== null) return;
        const sdp = this.pc.localDescription;
        // this.localSDP = sdp;
        res(sdp);
      };
    });
  }

  async handleOffer(sessionDescription: RTCSessionDescription): Promise<RTCSessionDescription> {
    await this.pc.setRemoteDescription(new RTCSessionDescription(sessionDescription));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    // Set the answer in the text area so we can copy and paste the base64 encoded value over to the host
    // this.remoteSDP = this.pc.remoteDescription;
    return this.pc.localDescription as RTCSessionDescription;
  }

  async receiveAnswer(sessionDescription: RTCSessionDescription) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(sessionDescription));
  }

  sendMessage(message: string) {
    this.lc.send(message);
  }
}
