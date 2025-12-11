const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthorized = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(400).send({
        msg: `Auth token is required`,
        error: `Auth token is required`,
        data: null,
      });
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) {
      res.status(400).send({
        msg: `wrong Auth token`,
        error: `wrong Auth token`,
        data: null,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error while authorizing", error);
    return res.status(400).send({
      msg: `Internal Server Error while authorizing`,
      error: `Internal Server Error while authorizing`,
      data: null,
    });
  }
};

module.exports = {
  isAuthorized,
};
