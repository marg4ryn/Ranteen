import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRating extends Document {
  student: Types.ObjectId; // Referencja do User
  dish: Types.ObjectId;    // Referencja do Dish
  date: Date;              // Dzień, w którym danie było serwowane i ocenione
  rating: number;          // Ocena 1-5
}

const RatingSchema: Schema<IRating> = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    date: { type: Date, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

RatingSchema.index({ student: 1, dish: 1, date: 1 }, { unique: true });
RatingSchema.index({ dish: 1, date: -1 });
RatingSchema.index({ student: 1 });

export default mongoose.model<IRating>('Rating', RatingSchema);