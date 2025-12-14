const express = require("express");
const { isAuthorized } = require("../middleware/auth");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");

const userRouter = express.Router();

const SAFE_FIELDS = "firstName lastName phone age gender skills";

// GET /user/requests/received
//create api to check received request for loggedIn user
userRouter.get("/user/request/received", isAuthorized, async (req, res) => {
  try {
    const { user: loggedInUser } = req;

    //logged in userId should match toUserId in connectionRequest document
    //only fetch requests with status interested
    const requestsReceived = await ConnectionRequest.find({
      $and: [{ toUserId: loggedInUser._id }, { status: "interested" }],
    }).populate("fromUserId", SAFE_FIELDS);

    res.json({
      msg: "Fetched connection requests received successfully",
      error: null,
      data: requestsReceived,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case Fetch connection requests received API fails
    res.status(400).json({
      msg: "Error while fetching connection requests received by loggedIn user",
      error: error.message,
      data: null,
    });
  }
});

// GET /user/connections
//create api to get all connections of loggedIn user
userRouter.get("/user/connections", isAuthorized, async (req, res) => {
  try {
    const { user: loggedInUser } = req;
    //either loggedIn userId is fromUserId or toUserId
    //status must be accepted
    //means loggedIn user has sent/received the connection requests and accepted them
    const userConnections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", SAFE_FIELDS)
      .populate("toUserId", SAFE_FIELDS);

    res.json({
      msg: "Fetched all connections successfully",
      error: null,
      data: userConnections,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case fetch all connections requests API fails
    res.status(400).json({
      msg: "Error while fetching all connection request of loggedIn user",
      error: error.message,
      data: null,
    });
  }
});

//create api to get other users on feed
//apply pagination so that limited users can be fetched in one api call
// GET /user/feed - Gets you the profiles of other users on platform
userRouter.get("/user/feed", isAuthorized, async (req, res) => {
  //ignore all profiles whom loggedIn user has already sent interested/ignored request
  //ignore all profiles who have sent interested/ignored request to loggedIn User
  //ignore loggedIn user's profile
  try {
    const { user: loggedInUser } = req;
    //extract page and limit from url query
    //or set default values of not sent in request

    let page = parseInt(req.query.page || 1);
    let limit = parseInt(req.query.limit || 10);

    //if limit sent is greated than 50 then set it to 50
    limit = limit > 50 ? 50 : limit;

    //skip logic
    //   page => 1 then records => 1 to 10; means skip 0 records
    //   page => 2 then records => 11 to 20; means skip 10 records
    const skip = (page - 1) * limit;

    //get all connections of loggedIn user ever interacted
    //has sent/received request
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    });

    //collect all those connections user id's as excluded list and remove duplicates
    //bcoz logged in user has already interacted with these profile
    //also add loggedIn user's id so that his own profile do not show up in feed

    const excludedProfileIds = new Set();

    connections.forEach((profile) => {
      excludedProfileIds.add(profile.fromUserId.toString());
      excludedProfileIds.add(profile.toUserId.toString());
    });

    excludedProfileIds.add(loggedInUser._id.toString());

    //run query through all users but exclude above user ids
    const usersOnFeed = await User.find({
      _id: { $nin: Array.from(excludedProfileIds) },
    })
      .select(SAFE_FIELDS)
      .skip(skip)
      .limit(limit);

    res.send(usersOnFeed);
  } catch (error) {
    console.error(error.message);
    //send response in case fetch feed API fails
    res.status(400).json({
      msg: "Error while fetching feed of loggedIn user",
      error: error.message,
      data: null,
    });
  }
});

module.exports = userRouter;
