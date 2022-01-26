module.exports = function isWSMessage(data) {
  return data != null
    && typeof data === 'object'
    && typeof data.type === 'string'
    && data.data != null;
};
