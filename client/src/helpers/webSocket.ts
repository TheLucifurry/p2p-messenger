// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebSocketMessageHandler = (this: WebSocket, ev: MessageEvent<any>) => any;

export function createSocketConnection(url: string, messageHandler: WebSocketMessageHandler) {
  return new Promise<WebSocket | null>((res) => {
    const ws = new WebSocket(url);
    ws.onopen = () => {
      ws.addEventListener('message', messageHandler);

      res(ws);
    };
    ws.onerror = () => {
      console.error('API: connection to signaling server faild');
      res(null);
    };
  });
}
