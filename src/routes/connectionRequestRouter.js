const express = require("express");

const connectionRequestRouter = express.Router();
const { isAuthorized } = require("../middleware/auth");
const {
  blockIncorrectStatus,
  validateReceiverId,
} = require("../middleware/connectionRequest");
const ConnectionRequest = require("../models/ConnectionRequest");

//create api to send interested/ignored request
//send receivers userId in request
//we can get senders userId from auth middleware
//POST /request/send/:status/:userId
connectionRequestRouter.post(
  "/request/send/:status/:userId",
  isAuthorized,
  //sanitize request data => only accepted status will be interested/ignored
  blockIncorrectStatus(["interested", "ignored"]),
  validateReceiverId,
  async (req, res) => {
    try {
      const { user: fromUser, toUser } = req;
      const { status } = req.params;
      const connectionRequest = new ConnectionRequest({
        fromUserId: fromUser._id,
        toUserId: toUser._id,
        status,
      });
      await connectionRequest.save();
      res.json({
        msg:
          status === "interested"
            ? `${fromUser.firstName} is interested in ${toUser.firstName}`
            : `${fromUser.firstName} has ingnored ${toUser.firstName}`,
        error: null,
        data: null,
      });
    } catch (error) {
      console.error(error.message);
      //send response in case login API fails
      res.status(400).json({
        msg: "Error while sending connection request",
        error: error.message,
        data: null,
      });
    }
  }
);

//create api to send accept/reject pending requests
//send receivers userId in request
//we can get senders userId from auth middleware
// POST /request/review/:status/:requestId

module.exports = connectionRequestRouter;
