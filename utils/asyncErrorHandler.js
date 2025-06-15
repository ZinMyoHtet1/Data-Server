module.exports = function (func) {
  return (req, res, next) => {
    func(req, res, next).catch((error) => {
      console.log(error.message);
      next(error);
    });
  };
};
