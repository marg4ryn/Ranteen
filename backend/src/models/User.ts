import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'student' | 'admin';
  googleId?: string;
  password?: string; // Only for admins
  profilePictureUrl?: string;
  isApproved: boolean; // For students, default false
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'admin'], required: true },
    googleId: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls but unique values
    password: { type: String, select: false }, // select: false hides password by default
    profilePictureUrl: { type: String },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook to hash password for admins
UserSchema.pre<IUser>('save', async function (next) {
  if (this.role === 'admin' && this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password for admin login
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;