export const enum EEventType {
  CHAT_CREATED = 0,
}

export type ChatMsgTime = string; // ISO-formatted datetime

export type ChatMsgData = string | EEventType; // Message itself or event message id

export type ChatMsgSender = string | null; // User short uuid or null (as third-party message)

export type ChatMsg = {
  sender: ChatMsgSender
  time: ChatMsgTime
  data: ChatMsgData
}
