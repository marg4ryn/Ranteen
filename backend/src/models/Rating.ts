import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRating extends Document {
  student: Types.ObjectId; // Ref to User (Student)
  dish: Types.ObjectId; // Ref to Dish
  menu: Types.ObjectId; // Ref to the specific Menu instance where the dish was served
  menuDate: Date; // Denormalized: Date the dish was served and rated (from Menu)
  rating: number; // 1-5
  // Timestamps (createdAt, updatedAt) automatically added
}

const RatingSchema: Schema<IRating> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    menu: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    menuDate: { type: Date, required: true }, // To easily filter ratings by serving date
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// Compound index to ensure a student can rate a specific dish on a specific menu (date) only once
RatingSchema.index({ student: 1, dish: 1, menu: 1 }, { unique: true });
// Other useful indexes
RatingSchema.index({ dish: 1, menuDate: 1 });
RatingSchema.index({ student: 1 });

// Pre-save hook to ensure menuDate is set to midnight UTC
RatingSchema.pre<IRating>('save', function(next) {
  if (this.menuDate) {
    this.menuDate.setUTCHours(0, 0, 0, 0);
  }
  next();
});

const Rating = mongoose.model<IRating>('Rating', RatingSchema);
export default Rating;