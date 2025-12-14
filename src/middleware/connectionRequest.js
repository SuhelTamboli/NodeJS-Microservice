const User = require("../models/User");
const mongoose = require("mongoose");

const blockIncorrectStatus = (AcceptedStatuses = []) => {
  return async (req, res, next) => {
    const { status } = req.params;
    //check if correct status is send in request
    if (!AcceptedStatuses.includes(status)) {
      return res.status(400).json({
        msg: `${status} cannot be sent in request`,
        error: `Status '${status}' is not allowed to be sent`,
        data: null,
      });
    }

    next();
  };
};

const validateReceiverId = async (req, res, next) => {
  const { userId } = req.params;
  const { user: loggedInUser } = req;
  //check if userId (receiver's id) sent is request is valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      msg: `${userId} is not valid userId`,
      error: `${userId} is not valid userId`,
      data: null,
    });
  }

  //check if userId (receiver's id) sent is request belong to actual user on DB
  const receiver = await User.findById(userId);
  if (!receiver) {
    return res.status(400).json({
      msg: `Receiver user does not exist`,
      error: `Receiver user does not exist`,
      data: null,
    });
  }

  //attach receiver in request
  req.toUser = receiver;

  next();
};

module.exports = {
  blockIncorrectStatus,
  validateReceiverId,
};
