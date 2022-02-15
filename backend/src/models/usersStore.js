const shortUUID = require('short-uuid');

class UsersStore {
  constructor() {
    this.data = new Map();
  }

  createUser(ctx) {
    const id = shortUUID.generate();
    this.data.set(id, ctx)
    return id;
  }

  deleteUser(id) {
    this.data.delete(id)
    return id;
  }

  getUser(id) {
    return this.data.get(id);
  }
}

const usersStore = new UsersStore();

module.exports = {
  usersStore,
};
