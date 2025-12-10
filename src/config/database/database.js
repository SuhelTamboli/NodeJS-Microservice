const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB successfully...");
  } catch (error) {
    console.log("Error while connecting to DB...", error);
    throw error;
  }
};

module.exports = connectDB;
