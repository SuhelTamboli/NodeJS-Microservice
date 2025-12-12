const express = require("express");

const authRouter = express.Router();
const { encryptPassword } = require("../middleware/user");
const User = require("../models/User");

//create a sample api to save user to DB
//POST - /signup
authRouter.post("/signup", encryptPassword, async (req, res) => {
  //Create a new instance of User model using user data (payload) passed in POST request
  const { firstName, lastName, email, password, phone, age, gender, skills } =
    req.body;
  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    phone,
    age,
    gender,
    skills,
  });
  try {
    //save user to DB
    const data = await newUser.save();
    //remove password from response before sending to client
    const signedUpUser = data.toObject();
    delete signedUpUser.password;
    //send response of singup API
    res.json({
      msg: "User Signed Up successfully",
      error: null,
      data: signedUpUser,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case singup API fails
    res.status(400).json({
      msg: "Error while signing up user",
      error: error.message,
      data: null,
    });
  }
});

//create api to login user
//POST - /login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    //DO NOT send actual msg like email does not exist in DB
    //send general msg like Invalid Credentials
    //this is called info leaking
    if (!existingUser) {
      return res.status(400).json({
        msg: "Invalid Credentials",
        error: "Invalid Credentials",
        data: null,
      });
    }
    //compare password from request with password in DB
    const isPasswordValid = await existingUser.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        msg: "Invalid Credentials",
        error: "Invalid Credentials",
        data: null,
      });
    }
    //create jwt token
    const jwtToken = await existingUser.generateJwtToken();
    //send jwt token in cookie when user log in to be used in next all requests
    res.cookie("token", jwtToken).json({
      msg: "User Logged In successfully",
      error: null,
      data: email,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case login API fails
    res.status(400).json({
      msg: "Error while logging in user",
      error: error.message,
      data: null,
    });
  }
});

module.exports = authRouter;
