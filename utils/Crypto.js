const crypto = require("crypto");

class Crypto {
  constructor() {}

  async generateUUID() {
    try {
      const userId = crypto.randomUUID();

      return userId;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Crypto();
