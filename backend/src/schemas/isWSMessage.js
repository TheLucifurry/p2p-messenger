/** Expect type:
 * {
 *    target: string, // Peer ID of target user
 *    body: { type, data } // Payload
 * }
 */
module.exports = function isWSMessage(message) {
  return message != null
    && typeof message === 'object'
    && typeof message['target'] === 'string'
    && message['body'] != null
    && typeof message['body'] === 'object'
    && typeof message['body']['type'] === 'string'
    && message['body']['data']
};
