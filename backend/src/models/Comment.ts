import mongoose, { Document, Schema, Types } from 'mongoose';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface IComment extends Document {
  student: Types.ObjectId; // Ref to User (Student)
  dish: Types.ObjectId; // Ref to Dish
  menu: Types.ObjectId; // Ref to the specific Menu instance where the dish was served
  menuDate: Date; // Denormalized: Date the dish was served and commented on
  text: string;
  status: CommentStatus;
  // Timestamps (createdAt, updatedAt) automatically added
  moderatedBy?: Types.ObjectId; // Ref to User (Admin who moderated)
  moderationTimestamp?: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    menu: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    menuDate: { type: Date, required: true },
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

// Indexes
CommentSchema.index({ dish: 1, menuDate: 1, status: 1 }); // For fetching approved comments for a dish on a date
CommentSchema.index({ student: 1 });
CommentSchema.index({ status: 1 }); // For admin moderation panel

// Pre-save hook to ensure menuDate is set to midnight UTC
CommentSchema.pre<IComment>('save', function(next) {
  if (this.menuDate) {
    this.menuDate.setUTCHours(0, 0, 0, 0);
  }
  next();
});

const Comment = mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;