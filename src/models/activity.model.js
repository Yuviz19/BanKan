import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true
    },
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: [
        'CARD_CREATED',
        'CARD_MOVED',
        'CARD_ASSIGNED',
        'PRIORITY_CHANGED',
        'COMMENT_ADDED',
        'MEMBER_JOINED'
      ],
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed, // the actual schema of the mongo model is not decided yet, frontend decides
      default: {}
    }
  },
  { timestamps: true }
);

export const Activity = model('Activity', activitySchema);
