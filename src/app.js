//dotenv package is needed to read .env files
/*
    require("dotenv").config(); =>
    Loads .env file contents into process.env by default. If DOTENV_KEY is present, 
    it smartly attempts to load encrypted .env.vault file contents into process.env.
*/
require("dotenv").config();

const connectDB = require("./config/database/database");
const User = require("./models/User");
const { blockFieldsFromUpdate } = require("./middleware/user");
const { isAuthorized } = require("./middleware/auth");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const connectionRequestRouter = require("./routes/connectionRequestRouter");

// create a new express server
const express = require("express");

//for parsing cookies sent in request
const cookieParser = require("cookie-parser");

const app = express();

const PORT = process.env.PORT;

//add middleware to convert JSON send in request to JS Object
//e.g. to read JSON body sent in POST request
//app.use means this middlware function will be called for every incoming request
app.use(express.json());

//add middleware to parse cookies coming in request so that we can access it in request handler
app.use(cookieParser());

//add route handlers
//request sent from client comes to app.js
//then diverted to appropriate handlers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);

//create a sample api to delete user from DB
app.delete("/users", isAuthorized, async (req, res) => {
  const { userId } = req.body;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      res.json({
        msg: "User Not Found By Id",
        error: null,
        data: deletedUser,
      });
    }
    res.json({
      msg: "User Deleted successfully",
      error: null,
      data: deletedUser,
    });
    res.json("user deleted successfully");
  } catch (error) {
    console.error(error);
    //send response in case deleting user by id API fails
    res.status(400).json({
      msg: "Error while deleting user by id",
      error: error.message,
      data: null,
    });
  }
});

//create a sample api to update user
//using blockFieldsFromUpdate middleware to block unwated fields to be updated
//in this request we are not allowing to update user email
app.patch(
  "/users",
  isAuthorized,
  blockFieldsFromUpdate(["email"]),
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

///create a sample api to get all users from DB
app.get("/users", isAuthorized, async (req, res) => {
  try {
    //pass empty object {} when getting all users data
    //returns array of objects
    const users = await User.find({});
    res.json({
      msg: "Get All Users successfull",
      error: null,
      data: users,
    });
  } catch (error) {
    console.error(error);
    //send response in case get all users API fails
    res.status(400).json({
      msg: "Error while get all users data",
      error: error.message,
      data: null,
    });
  }
});

//create a sample api to get one user by email from DB
app.get("/user", isAuthorized, async (req, res) => {
  const { email } = req.body;
  try {
    //pass empty object {} when getting all users data
    //returns array of objects
    const user = await User.find({ email });
    if (user.length === 0) {
      res.json({
        msg: "User Not Found",
        error: null,
        data: user,
      });
    }
    res.json({
      msg: "Get User by Email successfull",
      error: null,
      data: user,
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    //send response in case get user by email API fails
    res.status(400).json({
      msg: "Error while updating get user by email",
      error: error.message,
      data: null,
    });
  }
});

//First connect to DB
//if connection is successful then only start the server
connectDB()
  .then(() => {
    app.listen(PORT || 3000, () => {
      console.log("App is listening on port", PORT);
    });
  })
  .catch(() => {
    console.log("some error occurred");
  });
