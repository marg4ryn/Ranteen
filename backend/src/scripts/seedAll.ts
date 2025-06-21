import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedDishes } from './seedDishes';
import { seedMenus } from './seedMenus';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Brakuje MONGO_URI w pliku .env');
  process.exit(1);
}

const seedAll = async () => {
  try {
    console.log('\n Seeding dań...');
    await seedDishes();

    console.log('\n Seeding menu...');
    await seedMenus();

    console.log('\n Wszystko zasiane pomyślnie!');
  } catch (error) {
    console.error(' Błąd podczas seedowania:', error);
  } 
};

seedAll();
