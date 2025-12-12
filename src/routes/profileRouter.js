const express = require("express");

const profileRouter = express.Router();

const { isAuthorized } = require("../middleware/auth");

//create api to get profile details of logged in user
//GET - /profile
profileRouter.get("/profile", isAuthorized, async (req, res) => {
  try {
    const { user } = req;
    //delete password field before sending response to client
    const currentUser = user.toObject();
    delete currentUser.password;
    res.json({
      msg: "User Profile data fetched successfully",
      error: null,
      data: currentUser,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case profile API fails
    res.status(400).json({
      msg: "Error while getting user profile",
      error: error.message,
      data: null,
    });
  }
});

module.exports = profileRouter;
