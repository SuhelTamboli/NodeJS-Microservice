const bcrypt = require("bcrypt");

const comparePassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword) return false;
  //this will compare password and return boolean
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  comparePassword,
};
