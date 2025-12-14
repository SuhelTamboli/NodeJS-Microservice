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
  //sanitize request data => only allowed statuses will be interested/ignored
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
      //send response in case sending connection request API fails
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
connectionRequestRouter.patch(
  "/request/review/:status/:requestId",
  isAuthorized,
  //sanitize request data => only allowed statuses will be accepted/rejected
  blockIncorrectStatus(["accepted", "rejected"]),
  async (req, res, next) => {
    try {
      const { status, requestId } = req.params;
      const { user: loggedInUser } = req;

      //the requestId should only belong to connectionRequest with status as interested
      const connectionRequest = await ConnectionRequest.findById(requestId);

      //if connection request is not in DB
      if (!connectionRequest) {
        return res.status(400).json({
          msg: "Connection request not found",
          error: null,
          data: null,
        });
      }

      //loggedIn user should be toUser for this request
      console.log(connectionRequest);
      if (!loggedInUser._id.equals(connectionRequest.toUserId)) {
        return res.status(400).json({
          msg: "This connection request does not belong to you",
          error: null,
          data: null,
        });
      }

      //update status and save updated connection request
      connectionRequest.status = status;
      const updatedConnectionRequest = await connectionRequest.save();
      res.json({
        msg: "Connection request updated successfully",
        error: null,
        data: updatedConnectionRequest,
      });
    } catch (error) {
      console.error(error.message);
      //send response in case reviewing connection request API fails
      res.status(400).json({
        msg: "Error while reviewing connection request",
        error: error.message,
        data: null,
      });
    }
  }
);

module.exports = connectionRequestRouter;
