import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// ==== MODELE ====
// Możesz dostosować ten model do swojego projektu
const commentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  text: String,
  date: String,
  user: {
    name: String,
    avatar: String
  },
  status: String
}, { _id: false });

const dishSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  imageUrl: String,
  averageRating: Number,
  comments: [commentSchema]
}, { _id: false });

const menuSchema = new mongoose.Schema({
  date: { type: String, required: true },
  dishes: [dishSchema]
});

const Menu = mongoose.model('Menu', menuSchema);

// ==== MOCKI ====

interface Comment {
  id: string;
  text: string;
  date: string;
  user: {
    name: string;
    avatar: string;
  };
  status: string;
}

interface Dish {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  averageRating: number;
  comments: Comment[];
}

const mockDishes: Dish[] = [
  {
    id: '1',
    name: 'Kotlet schabowy',
    description: 'Tradycyjny kotlet schabowy z ziemniakami i surówką z kapusty',
    category: 'Danie główne',
    imageUrl: 'https://pliki.doradcasmaku.pl/kotlet-schabowy-w-smietanie0-4',
    averageRating: 4.2,
    comments: [
      {
        id: 'c1',
        text: 'Bardzo smaczny, ale mógłby być bardziej chrupiący.',
        date: '2023-11-02T12:30:00',
        user: {
          name: 'Jan Kowalski',
          avatar: 'https://v.wpimg.pl/eXkwLmpwSjkKFTpeXwxHLElNbgQZVUl6HlV2T19BU2ETR2MdHwUROQdaLQ8TDQEqBAAlCF4AFTsPGWIdHFgMNQoQKS4RFA09REV8X0FYVW5ERXxCAAUKMg4cOEASEh91Hw44GBwCSGs0QnxeFllIIFsOfBUIRxwhW1kmHRdVGA'
        },
        status: 'APPROVED'
      },
      {
        id: 'c2',
        text: 'Porcja mogłaby być większa, ale smak super!',
        date: '2023-11-02T13:15:00',
        user: {
          name: 'Anna Nowak',
          avatar: 'https://previews.123rf.com/images/stockbroker/stockbroker1408/stockbroker140802621/31052570-portret-%C5%82adna-dziewczyna-w-wie%C5%9B.jpg'
        },
        status: 'APPROVED'
      }
    ]
  },
  {
    id: '2',
    name: 'Zupa pomidorowa',
    description: 'Domowa zupa pomidorowa z ryżem i świeżymi ziołami',
    category: 'Zupa',
    imageUrl: 'https://img.wprost.pl/img/wysmienita-zupa-pomidorowa-ze-swiezych-pomidorow-z-tego-przepisu-przygotowywala-ja-moja-babcia/1f/1a/c69122a80c37084cbe83608f4120.webp',
    averageRating: 4.5,
    comments: []
  },
  {
    id: '3',
    name: 'Pierogi ruskie',
    description: 'Pierogi z nadzieniem z ziemniaków i twarogu, podawane z cebulką',
    category: 'Danie główne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Pierogi_ruskie.jpg',
    averageRating: 4.8,
    comments: []
  },
  {
    id: '4',
    name: 'Surówka z marchewki',
    description: 'Świeża surówka z marchewki z dodatkiem jabłka i rodzynek',
    category: 'Dodatek',
    imageUrl: 'https://img.wprost.pl/img/surowke-z-marchewki-robie-inaczej-niz-wszyscy-dodaje-do-niej-2-aromatyczne-skladniki/e1/0a/e94544d85bf9eae22bb31cd9402f.webp',
    averageRating: 3.9,
    comments: []
  },
  {
    id: '5',
    name: 'Kompot owocowy',
    description: 'Kompot z sezonowych owoców',
    category: 'Napój',
    imageUrl: 'https://www.przyslijprzepis.pl/media/cache/big/uploads/media/recipe/0004/80/afb398b5903c5eb7534bda23d7b16603808cf77d.jpeg',
    averageRating: 4.0,
    comments: []
  },
  {
    id: '6',
    name: 'Naleśniki z serem',
    description: 'Naleśniki z nadzieniem z sera twarogowego i rodzynkami, polane sosem jogurtowym',
    category: 'Deser',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Nalesniki_z_serem.jpg',
    averageRating: 4.7,
    comments: []
  },
  {
    id: '7',
    name: 'Gulasz wołowy',
    description: 'Gulasz z wołowiny z warzywami, podawany z kaszą gryczaną',
    category: 'Danie główne',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Gulasz.jpg',
    averageRating: 4.3,
    comments: []
  },
  {
    id: '8',
    name: 'Rosół z makaronem',
    description: 'Tradycyjny rosół z kurczaka z domowym makaronem i natką pietruszki',
    category: 'Zupa',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Rosol.jpg',
    averageRating: 4.6,
    comments: []
  }
];

// ==== MOCK MENU ====

const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const getDates = (): string[] => {
  const dates: string[] = [];
  for (let i = -3; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
};

const getRandomDishes = (count: number): Dish[] => {
  const shuffled = [...mockDishes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const dates = getDates();

const mockMenus = [
  { date: dates[3], dishes: [mockDishes[0], mockDishes[1], mockDishes[3], mockDishes[4]] },
  { date: dates[4], dishes: [mockDishes[2], mockDishes[7], mockDishes[4]] },
  { date: dates[5], dishes: [mockDishes[6], mockDishes[1], mockDishes[3], mockDishes[5]] },
  { date: dates[0], dishes: getRandomDishes(4) },
  { date: dates[1], dishes: getRandomDishes(3) },
  { date: dates[2], dishes: getRandomDishes(4) },
  { date: dates[6], dishes: getRandomDishes(3) },
  { date: dates[7], dishes: getRandomDishes(4) }
];

// ==== SEEDOWANIE ====

dotenv.config();

export const seedMenus = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Brakuje MONGO_URI w pliku .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Połączono z MongoDB.');

  try {
    await Menu.deleteMany({});
    console.log('Wyczyszczono kolekcję Menu.');

    for (const menu of mockMenus) {
      const preparedDishes = menu.dishes.map((dish: Dish) => ({
        name: dish.name,
        description: dish.description,
        category: dish.category,
        imageUrl: dish.imageUrl,
        averageRating: dish.averageRating,
        comments: dish.comments.map((comment: Comment) => ({
          _id: comment.id || uuidv4(),
          text: comment.text,
          date: comment.date,
          user: {
            name: comment.user.name,
            avatar: comment.user.avatar
          },
          status: comment.status
        }))
      }));

      const newMenu = new Menu({ date: menu.date, dishes: preparedDishes });
      await newMenu.save();
      console.log(`Dodano menu na dzień ${menu.date}`);
    }

    console.log('Zakończono dodawanie menu.');
  } catch (err) {
    console.error('Błąd podczas seedowania menu:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Rozłączono z MongoDB.');
  }
};

seedMenus();
