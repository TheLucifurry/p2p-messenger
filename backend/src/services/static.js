
const NodeStatic = require('node-static');

module.exports = function createStaticServer(path, options) {
  return new NodeStatic.Server(path, options);
};
