import { mockDishes } from './mockDishes';

// Helper to get a subset of dishes
const getRandomDishes = (count) => {
  const shuffled = [...mockDishes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get today's date
const today = new Date();
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Create dates for the week
const getDates = () => {
  const dates = [];
  for (let i = -3; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(formatDate(date));
  }
  return dates;
};

const dates = getDates();

export const mockMenus = [
  {
    id: '1',
    date: dates[3], // Today
    dishes: [
      mockDishes[0], // Kotlet schabowy
      mockDishes[1], // Zupa pomidorowa
      mockDishes[3], // Surówka z marchewki
      mockDishes[4]  // Kompot
    ]
  },
  {
    id: '2',
    date: dates[4], // Tomorrow
    dishes: [
      mockDishes[2], // Pierogi ruskie
      mockDishes[7], // Rosół
      mockDishes[4]  // Kompot
    ]
  },
  {
    id: '3',
    date: dates[5], // Day after tomorrow
    dishes: [
      mockDishes[6], // Gulasz
      mockDishes[1], // Zupa pomidorowa
      mockDishes[3], // Surówka
      mockDishes[5]  // Naleśniki
    ]
  },
  {
    id: '4',
    date: dates[0], // 3 days ago
    dishes: getRandomDishes(4)
  },
  {
    id: '5',
    date: dates[1], // 2 days ago
    dishes: getRandomDishes(3)
  },
  {
    id: '6',
    date: dates[2], // Yesterday
    dishes: getRandomDishes(4)
  },
  {
    id: '7',
    date: dates[6], // Future
    dishes: getRandomDishes(3)
  },
  {
    id: '8',
    date: dates[7], // Future
    dishes: getRandomDishes(4)
  }
];