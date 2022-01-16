
module.exports = function createSignalServer(path, options) {
  return new NodeStatic.Server(path, options);;
};
