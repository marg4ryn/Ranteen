import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import connectDB from '../config/database';

dotenv.config();

const usersToSeed = [
  {
    email: process.env.ADMIN_EMAIL || 'admin@szkola.edu.pl',
    name: 'Administrator',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    role: 'admin',
    isApproved: true,
  },
  {
    email: 'nauczyciel1@szkola.edu.pl',
    name: 'Nauczyciel Jan',
    password: 'Nauczyciel123!',
    role: 'teacher',
    isApproved: true,
  },
  {
    email: 'uczen1@szkola.edu.pl',
    name: 'Uczeń Anna',
    password: 'Uczen123!',
    role: 'student',
    isApproved: true,
  },
];

export const seedUsers = async () => {
  try {
    await connectDB();
    console.log('Połączono z MongoDB.');

    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`Użytkownik ${userData.email} już istnieje. Pomijanie...`);
        continue;
      }

      const newUser = new User(userData);
      await newUser.save();
      console.log(`Dodano użytkownika: ${userData.name} (${userData.email})`);
    }
  } catch (error) {
    console.error('Błąd podczas dodawania użytkowników:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Rozłączono z MongoDB.');
  }
};

seedUsers();
