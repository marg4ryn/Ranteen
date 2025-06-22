import mongoose, { Document, Schema, Types } from 'mongoose';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface IComment extends Document {
  student: Types.ObjectId;      // Referencja do User
  dish: Types.ObjectId;         // Referencja do Dish
  date: Date;                   // Dzień, w którym danie było serwowane i komentowane
  text: string;
  status: CommentStatus;
  moderatedBy?: Types.ObjectId; // Referencja do User (admin)
  moderationTimestamp?: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    date: { type: Date, required: true },
    text: { type: String, required: true, trim: true, minlength: 3, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderationTimestamp: { type: Date },
  },
  { timestamps: true }
);

CommentSchema.index({ dish: 1, date: -1 });
CommentSchema.index({ status: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);