const shortUUID = require('short-uuid');

class PeersStore {
  constructor() {
    this.data = new Map();
  }

  create(ctx) {
    const id = shortUUID.generate();
    this.data.set(id, ctx)
    return id;
  }

  delete(id) {
    this.data.delete(id)
    return id;
  }

  get(id) {
    return this.data.get(id);
  }
}

const peersStore = new PeersStore();

module.exports = {
  peersStore,
};
