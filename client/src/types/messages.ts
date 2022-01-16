export const enum EMsgType {
  IN = 0,
  OUT = 1,
  EVENT = 2,
}

export const enum EEventType {
  CHAT_CREATED = 0,
}

export type ChatMsgTime = string; // ISO-formatted datetime

export type ChatMsgData = string | EEventType; // Message itself or event message id

export type ChatMsgSender = string; // User short uuid

export type ChatMsg = {
  type: EMsgType
  time: ChatMsgTime
  data: ChatMsgData
  sender?: ChatMsgSender
}
