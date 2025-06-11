const login = (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Login route",
  });
};

const register = (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Register route",
  });
};

module.exports = { login, register };
