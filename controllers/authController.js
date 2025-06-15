const login = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Login route",
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Register route",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register };
