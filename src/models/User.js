const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      unique: true,
      required: [true, "Email is required"],
      validate: {
        validator: (value) => {
          return validator.isEmail(value);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: (value) => {
          return validator.isStrongPassword(value);
        },
        message: "Please enter strong password",
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

//since generating jwt token while logging in is closely associated with User model
//we can add it in User Schema
//create a method to generate jwt token when user login
userSchema.methods.generateJwtToken = async function () {
  const user = this;
  const jwtToken = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return jwtToken;
};

//since validating password provided while logging in with DB password is closely associated with User model
//we can add method to validate password in User Schema
//create a method to validate password while user login
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const hashedPassword = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    hashedPassword
  );
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
