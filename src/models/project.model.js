import { Schema, model } from "mongoose";

const columnSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    position: {
      type: Number,
      required: true
    }
  }
)

const projectSchema = new Schema(
  {
    organisation: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    columns: {
      type: [columnSchema],
      default: [
        { name: "TO-DO", position: 1000 },
        { name: "IN PROGRESS", position: 2000 },
        { name: "DONE", position: 3000 }
      ]
    },
    createdBy: {
      type: Schema.Type.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export const Project = model("Project", projectSchema);
