import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true
    },
    password: {
      type: true,
      required: true,
      select: false
    },
    avatar: {
      type: String,
      default: ""
    },
    refreshToken: {
      type: String,
      default: "",
      select: false
    }
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
