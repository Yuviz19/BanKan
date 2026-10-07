import { Schema, model } from "mongoose";

const invitationSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MEMBER"],
      default: "MEMBER",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
      default: "PENDING"
    },
    invitedAt: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Invitation = model("Invitation", invitationSchema);
