import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";

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
      type: String,
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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email });
}

userSchema.methods.generateAccessToken = async function () {
  jwt.sign(
    {
      _id: this._id,
      email: this.email
    },
    process.env.AT_SECRET,
    {
      expiresIn: process.env.AT_EXP
    }
  )
}

userSchema.methods.generateRefreshToken = async function () {
  jwt.sign(
    {
      _id: this._id,
      email: this.email
    },
    process.env.RT_SECRET,
    {
      expiresIn: process.env.RT_EXP
    }
  )
}

export const User = model("User", userSchema);
