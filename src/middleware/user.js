const bcrypt = require("bcrypt");

const blockFieldsFromUpdate = (fields = []) => {
  return (req, res, next) => {
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        return res.status(400).json({
          msg: `${field} cannot be updated`,
          error: `Field '${field}' is not allowed in update`,
          data: null,
        });
      }
    });
    next();
  };
};

const encryptPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({
        msg: `Password is required`,
        error: `Password is required`,
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    req.body.password = hashedPassword;
    return next();
  } catch (error) {
    console.error("Error encrypting password:", error);
    return res.status(400).json({
      msg: `Internal Server Error while encrypting password`,
      error: `Internal Server Error while encrypting password`,
      data: null,
    });
  }
};

module.exports = {
  blockFieldsFromUpdate,
  encryptPassword,
};
