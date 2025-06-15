const jwt = require("jsonwebtoken");

class JWT {
  constructor() {
    this.jwt_secret = process.env.JWT_SECRET;
  }

  sign(payload) {
    return jwt.sign(payload, this.jwt_secret, { algorithm: "HS256" });
  }

  verify(token) {
    return jwt.verify(token, this.jwt_secret);
  }
}

module.exports = JWT;
