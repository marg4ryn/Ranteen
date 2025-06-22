// src/scripts/seeder.ts

import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database'; // Załóżmy, że masz taki plik

// Importuj nowe, poprawne modele
import User, { IUser } from '../models/User';
import Dish, { IDish } from '../models/Dish';
import Menu from '../models/Menu';
import Comment from '../models/Comment';
import Rating from '../models/Rating';

// Ładowanie zmiennych środowiskowych
dotenv.config();

// Twoje oryginalne mockowe dane o daniach (lekko dostosowane)
const mockDishData = [
  {
    mockId: '1', // Użyjemy tego jako klucza do mapowania
    name: 'Kotlet schabowy',
    description: 'Tradycyjny kotlet schabowy z ziemniakami i surówką z kapusty',
    category: 'danie główne',
    imageUrl: 'https://pliki.doradcasmaku.pl/kotlet-schabowy-w-smietanie0-4',
    comments: [
      {
        text: 'Bardzo smaczny, ale mógłby być bardziej chrupiący.',
        date: '2023-11-02T12:30:00',
        status: 'approved',
      },
      {
        text: 'Porcja mogłaby być większa, ale smak super!',
        date: '2023-11-02T13:15:00',
        status: 'approved',
      },
    ],
  },
  {
    mockId: '2',
    name: 'Zupa pomidorowa',
    description: 'Domowa zupa pomidorowa z ryżem i świeżymi ziołami',
    category: 'zupa',
    imageUrl: 'https://img.wprost.pl/img/wysmienita-zupa-pomidorowa-ze-swiezych-pomidorow-z-tego-przepisu-przygotowywala-ja-moja-babcia/1f/1a/c69122a80c37084cbe83608f4120.webp',
    comments: [],
  },
  {
    mockId: '3',
    name: 'Pierogi ruskie',
    description: 'Pierogi z nadzieniem z ziemniaków i twarogu, podawane z cebulką',
    category: 'danie główne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Pierogi_ruskie.jpg',
    comments: [],
  },
    {
    mockId: '4',
    name: 'Surówka z marchewki',
    description: 'Świeża surówka z marchewki z dodatkiem jabłka i rodzynek',
    category: 'dodatek',
    imageUrl: 'https://img.wprost.pl/img/surowke-z-marchewki-robie-inaczej-niz-wszyscy-dodaje-do-niej-2-aromatyczne-skladniki/e1/0a/e94544d85bf9eae22bb31cd9402f.webp',
    comments: [],
  },
  {
    mockId: '5',
    name: 'Kompot owocowy',
    description: 'Kompot z sezonowych owoców',
    category: 'napój',
    imageUrl: 'https://www.przyslijprzepis.pl/media/cache/big/uploads/media/recipe/0004/80/afb398b5903c5eb7534bda23d7b16603808cf77d.jpeg',
    comments: [],
  },
    {
    mockId: '6',
    name: 'Naleśniki z serem',
    description: 'Naleśniki z nadzieniem z sera twarogowego i rodzynkami, polane sosem jogurtowym',
    category: 'deser',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Nalesniki_z_serem.jpg',
    comments: [],
  },
];

// Generowanie dat dla menu
const today = new Date();
const getDates = (): Date[] => {
  const dates: Date[] = [];
  for (let i = -3; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setUTCHours(0, 0, 0, 0); // Normalizuj do północy UTC
    dates.push(d);
  }
  return dates;
};

const menuDates = getDates();

// Struktura menu używająca mockId do późniejszego mapowania
const mockMenuStructure = [
  { date: menuDates[3], dishMockIds: ['1', '2', '4', '5'] },
  { date: menuDates[4], dishMockIds: ['3', '4'] },
  { date: menuDates[5], dishMockIds: ['6', '2', '4'] },
];

const seedDatabase = async () => {
  try {
    // Połącz się z bazą. Jeśli `connectDB` już istnieje, użyj go.
    // W przeciwnym razie, użyj poniższego kodu:
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Połączono z MongoDB.');

    // 1. Czyszczenie kolekcji
    console.log('Czyszczenie starych danych...');
    await Promise.all([
      User.deleteMany({}),
      Dish.deleteMany({}),
      Menu.deleteMany({}),
      Comment.deleteMany({}),
      Rating.deleteMany({}),
    ]);
    console.log('Kolekcje wyczyszczone.');

    // 2. Tworzenie użytkowników
    const usersToCreate = [
      { name: 'Jan Kowalski', email: 'jan.kowalski@example.com', role: 'student', isApproved: true },
      { name: 'Anna Nowak', email: 'anna.nowak@example.com', role: 'student', isApproved: true },
      { name: 'Piotr Wiśniewski', email: 'piotr.wisniewski@example.com', role: 'student', isApproved: true }
    ];
    const createdUsers = await User.insertMany(usersToCreate);
    const students = createdUsers.filter(u => u.role === 'student');
    console.log(`Utworzono ${createdUsers.length} użytkowników.`);

    // 3. Tworzenie dań
    const dishesToCreate = mockDishData.map(d => ({
      name: d.name,
      description: d.description,
      category: d.category,
      imageUrl: d.imageUrl,
    }));
    const createdDishes = await Dish.insertMany(dishesToCreate);
    console.log(`Utworzono ${createdDishes.length} dań.`);

    // Mapa do łatwego odnajdywania ID dań na podstawie nazwy
    const dishMapByName: Map<string, Types.ObjectId> = new Map(
        createdDishes.map(d => [d.name, d._id])
    );
    // Mapa do łatwego odnajdywania ID na podstawie mockId
    const dishMapByMockId: Map<string, Types.ObjectId> = new Map();
    mockDishData.forEach(mock => {
        const dish = createdDishes.find(d => d.name === mock.name);
        if (dish) {
            dishMapByMockId.set(mock.mockId, dish._id);
        }
    });

    // 4. Tworzenie Menu
    const menusToCreate = mockMenuStructure.map(m => ({
        date: m.date,
        dishes: m.dishMockIds.map(mockId => dishMapByMockId.get(mockId)!).filter(Boolean)
    }));
    const createdMenus = await Menu.insertMany(menusToCreate);
    console.log(`Utworzono ${createdMenus.length} menu.`);

    // 5. Tworzenie komentarzy
    const commentsToCreate = [];
    for (const mock of mockDishData) {
        if (mock.comments.length > 0) {
            const dishId = dishMapByName.get(mock.name);
            if (dishId) {
                for (const comment of mock.comments) {
                    commentsToCreate.push({
                        dish: dishId,
                        student: students[Math.floor(Math.random() * students.length)]._id, // losowy student
                        date: new Date(comment.date),
                        text: comment.text,
                        status: comment.status,
                    });
                }
            }
        }
    }
    await Comment.insertMany(commentsToCreate);
    console.log(`Utworzono ${commentsToCreate.length} komentarzy.`);

    // 6. Tworzenie Ocen
    const ratingsToCreate = [];
    for (const menu of createdMenus) {
        for (const dishId of menu.dishes) {
            // Każde danie w menu zostanie ocenione przez 1 do 3 studentów
            const numberOfRatings = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numberOfRatings; i++) {
                ratingsToCreate.push({
                    dish: dishId,
                    student: students[i % students.length]._id, // różni studenci
                    date: menu.date,
                    rating: Math.floor(Math.random() * 5) + 1, // ocena 1-5
                });
            }
        }
    }
    await Rating.insertMany(ratingsToCreate);
    console.log(`Utworzono ${ratingsToCreate.length} ocen.`);

    // 7. Aktualizacja `averageRating` i `ratingCount` w daniach
    console.log('Aktualizowanie średnich ocen dań...');
    const ratingAggregates = await Rating.aggregate([
        {
            $group: {
                _id: '$dish',
                averageRating: { $avg: '$rating' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);
    
    for (const aggregate of ratingAggregates) {
        await Dish.updateOne(
            { _id: aggregate._id },
            { 
                $set: {
                    averageRating: parseFloat(aggregate.averageRating.toFixed(2)),
                    ratingCount: aggregate.ratingCount
                }
            }
        );
    }
    console.log(`Zaktualizowano oceny dla ${ratingAggregates.length} dań.`);


  } catch (error) {
    console.error('Błąd podczas seedowania bazy danych:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Rozłączono z MongoDB. Seedowanie zakończone.');
  }
};

seedDatabase();