export function createChatURL(chatId: string, urlOrigin: string = location.origin) {
  return `${urlOrigin}?chat=${chatId}`;
}
export function parseChatFromURL(url: string) {
  const { search } = new URL(url);
  return new URLSearchParams(search).get('chat');
}
