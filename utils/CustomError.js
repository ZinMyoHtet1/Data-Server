class CustomError extends Error {
  constructor({ status, statusCode, message }) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
  }
}

module.exports = CustomError;
