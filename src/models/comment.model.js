import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    card: {
      type: Schema.Types.ObjectId,
      ref: "Card",
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
