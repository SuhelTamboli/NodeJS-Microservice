//dotenv package is needed to read .env files
/*
    require("dotenv").config(); =>
    Loads .env file contents into process.env by default. If DOTENV_KEY is present, 
    it smartly attempts to load encrypted .env.vault file contents into process.env.
*/
require("dotenv").config();

const connectDB = require("./config/database/database");
const User = require("./models/User");

// create a new express server
const express = require("express");

const app = express();

const PORT = process.env.PORT;

//add middleware to convert JSON send in requesu to JS Object
//e.g. to read JSON body sent in POST request
//app.use means this middlware function will be called for every incoming request
app.use(express.json());

//CRUD OPERATIONS

//create a sample api to delete user from DB
app.delete("/users", async (req, res) => {
  const { userId } = req.body;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      res.send("user not found by id");
    }
    res.send("user deleted successfully");
  } catch (error) {
    console.error(error);
    //send response in case singup API fails
    res.status(400).send("Error occurrd while deleting user by id", error);
  }
});

//create a sample api to update user
app.patch("/users", async (req, res) => {
  const { userId } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      returnDocument: "after",
    });
    res.send("User updated successfully ");
  } catch (error) {
    console.error(error);
    //send response in case singup API fails
    res.status(400).send("Error occurrd while updating user" + error);
  }
});

///create a sample api to get all users from DB
app.get("/users", async (req, res) => {
  try {
    //pass empty object {} when getting all users data
    //returns array of objects
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    console.error(error);
    //send response in case singup API fails
    res.status(400).send("Error occurrd while get all users", error);
  }
});

//create a sample api to get one user by email from DB
app.get("/user", async (req, res) => {
  const { email } = req.body;
  try {
    //pass empty object {} when getting all users data
    //returns array of objects
    const user = await User.find({ email });
    if (user.length === 0) {
      res.send("user not found");
    }
    res.send(user);
  } catch (error) {
    console.error(error);
    //send response in case singup API fails
    res.status(400).send("Error occurrd while get user by email", error);
  }
});

//create a sample api to save user to DB
app.post("/signup", async (req, res) => {
  //Create a new instance of User model using user data (payload) passed in POST request
  const newUser = new User(req.body);
  try {
    //save user to DB
    const data = await newUser.save();
    //send response of singup API
    res.send("User Data saved successfully");
  } catch (error) {
    console.error(error);
    //send response in case singup API fails
    res.status(400).send("Error occurrd while signp", error);
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
