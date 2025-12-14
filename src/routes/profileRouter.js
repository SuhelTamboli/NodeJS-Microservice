const express = require("express");

const profileRouter = express.Router();

const { isAuthorized } = require("../middleware/auth");
const {
  blockFieldsFromUpdate,
  encryptPassword,
} = require("../middleware/user");
const User = require("../models/User");

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

//create a api to update user profile data
//using blockFieldsFromUpdate middleware to block unwated fields to be updated
//in this request we are not allowing to update user email and password
//PATCH - /profile
profileRouter.patch(
  "/profile",
  isAuthorized,
  blockFieldsFromUpdate(["email", "password"]),
  async (req, res) => {
    const { userId } = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
        returnDocument: "after",
        runValidators: true,
      });
      res.json({
        msg: "User Updated successfully",
        error: null,
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      //send response in case update API fails
      res.status(400).json({
        msg: "Error while updating user data",
        error: error.message,
        data: null,
      });
    }
  }
);

//create api to change password (e.g. via forgot password)
//PATCH - /profile/changePassword
profileRouter.patch(
  "/profile/changePassword",
  isAuthorized,
  async (req, res, next) => {
    const currentUser = req.user;
    const { oldPassword, newPassword } = req.body;
    //check if old password provided in request is correct
    //compare password from request with password in DB
    const isPasswordValid = await currentUser.validatePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        msg: "Please enter correct old password",
        error: "Incorrect old password",
        data: null,
      });
    }
    //call middleware to encrypt new password and then write login as next function to be executed after
    //password encryption middleware executed
    req.body.password = newPassword;
    return encryptPassword(req, res, async () => {
      const hashedPassword = req.body.password;
      try {
        const updatedUser = await User.findByIdAndUpdate(
          currentUser._id,
          { password: hashedPassword },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );
        //logout user and send api response
        return res.cookie("token", null).json({
          msg: "User Profile password changed successfully",
          error: null,
          data: null,
        });
      } catch (error) {
        console.error(error);
        //send response in case update API fails
        res.status(400).json({
          msg: "Error while user profile password change",
          error: error.message,
          data: null,
        });
      }
    });
  }
);

module.exports = profileRouter;
