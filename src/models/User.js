const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      maxLength: [10, "First Name can have maximum 10 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      maxLength: [10, "Last Name can have maximum 10 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: (value) => {
          return validator.isEmail(value);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    phone: {
      type: String,
      required: [true, "Phone Number is required"],
      maxLength: [10, "Phone number can have maximum 10 digits"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be greater than 18 years"],
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "{VALUE} is not supported",
      },
    },
    skills: {
      type: [String],
      validate: {
        validator: (value) => {
          return value.length <= 5; // max 5 skills allowed
        },
        message: "You can add a maximum of 5 skills",
      },
    },
  },
  {
    //stores createdAt and updatedAt fields in each document automatically
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
