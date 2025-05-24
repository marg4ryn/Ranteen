import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import connectDB from './config/database';

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = 'Default Admin';

  try {
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const newAdmin = new User({
      email: adminEmail,
      name: adminName,
      password: adminPassword, // Will be hashed by pre-save hook
      role: 'admin',
      isApproved: true,
    });

    await newAdmin.save();
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();