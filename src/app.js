//dotenv package is needed to read .env files
/*
    require("dotenv").config(); =>
    Loads .env file contents into process.env by default. If DOTENV_KEY is present, 
    it smartly attempts to load encrypted .env.vault file contents into process.env.
*/
require("dotenv").config();

const connectDB = require("./config/database/database");
const User = require("./models/User");
const { blockFields, encryptPassword } = require("./middleware/user");
const { isAuthorized } = require("./middleware/auth");

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

//CRUD OPERATIONS

//create a sample api to delete user from DB
app.delete("/users", isAuthorized, async (req, res) => {
  const { userId } = req.body;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      res.send({
        msg: "User Not Found By Id",
        error: null,
        data: deletedUser,
      });
    }
    res.send({
      msg: "User Deleted successfully",
      error: null,
      data: deletedUser,
    });
    res.send("user deleted successfully");
  } catch (error) {
    console.error(error);
    //send response in case deleting user by id API fails
    res.status(400).send({
      msg: "Error while deleting user by id",
      error: error.message,
      data: null,
    });
  }
});

//create a sample api to update user
//using blockFields middleware to block unwated fields to be updated
//in this request we are not allowing to update user email
app.patch("/users", isAuthorized, blockFields(["email"]), async (req, res) => {
  const { userId } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send({
      msg: "User Updated successfully",
      error: null,
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    //send response in case update API fails
    res.status(400).send({
      msg: "Error while updating user data",
      error: error.message,
      data: null,
    });
  }
});

///create a sample api to get all users from DB
app.get("/users", isAuthorized, async (req, res) => {
  try {
    //pass empty object {} when getting all users data
    //returns array of objects
    const users = await User.find({});
    res.send({
      msg: "Get All Users successfull",
      error: null,
      data: users,
    });
  } catch (error) {
    console.error(error);
    //send response in case get all users API fails
    res.status(400).send({
      msg: "Error while updating get all users data",
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
      res.send({
        msg: "User Not Found",
        error: null,
        data: user,
      });
    }
    res.send({
      msg: "Get User by Email successfull",
      error: null,
      data: user,
    });
    res.send(user);
  } catch (error) {
    console.error(error);
    //send response in case get user by email API fails
    res.status(400).send({
      msg: "Error while updating get user by email",
      error: error.message,
      data: null,
    });
  }
});

//create a sample api to save user to DB
app.post("/signup", encryptPassword, async (req, res) => {
  //Create a new instance of User model using user data (payload) passed in POST request
  const newUser = new User({
    firstName: req.body?.firstName,
    lastName: req.body?.lastName,
    email: req.body?.email,
    password: req.body?.password,
    phone: req.body?.phone,
    age: req.body?.age,
    gender: req.body?.gender,
    skills: req.body?.skills,
  });
  try {
    //save user to DB
    const data = await newUser.save();
    //remove password from response before sending to client
    const signedUpUser = data.toObject();
    delete signedUpUser.password;
    //send response of singup API
    res.send({
      msg: "User Signed Up successfully",
      error: null,
      data: signedUpUser,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case singup API fails
    res.status(400).send({
      msg: "Error while signing up user",
      error: error.message,
      data: null,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    //DO NOT send actual msg like email does not exist in DB
    //send general msg like Invalid Credentials
    //this is called info leaking
    if (!existingUser) {
      return res.status(400).send({
        msg: "Invalid Credentials",
        error: "Invalid Credentials",
        data: null,
      });
    }
    //compare password from request with password in DB
    const isPasswordValid = await existingUser.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).send({
        msg: "Invalid Credentials",
        error: "Invalid Credentials",
        data: null,
      });
    }
    //create jwt token
    const jwtToken = await existingUser.generateJwtToken();
    //send jwt token in cookie when user log in to be used in next all requests
    res.cookie("token", jwtToken);
    res.send({
      msg: "User Logged In successfully",
      error: null,
      data: email,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case login API fails
    res.status(400).send({
      msg: "Error while logging in user",
      error: error.message,
      data: null,
    });
  }
});

app.get("/profile", isAuthorized, async (req, res) => {
  try {
    const { user } = req;
    //delete password field before sending response to client
    const currentUser = user.toObject();
    delete currentUser.password;
    res.send({
      msg: "User Profile data fetched successfully",
      error: null,
      data: currentUser,
    });
  } catch (error) {
    console.error(error.message);
    //send response in case profile API fails
    res.status(400).send({
      msg: "Error while getting user profile",
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
