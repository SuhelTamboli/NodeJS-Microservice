const mongoose = require("mongoose");

const ConnectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Types.ObjectId,
      required: [true, "fromUserId is required"],
      ref: "User",
      index: 1,
    },
    toUserId: {
      type: mongoose.Types.ObjectId,
      required: [true, "toUserId is required"],
      ref: "User",
      index: 1,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: "{VALUE} is not supported",
      },
    },
  },
  { timestamps: true }
);

//write pre save hook
ConnectionRequestSchema.pre("save", function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot send request to yourself");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

module.exports = ConnectionRequest;
