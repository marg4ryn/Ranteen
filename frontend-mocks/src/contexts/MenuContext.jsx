import { createContext } from 'react';

export const MenuContext = createContext({
  menus: [],
  setMenus: () => {},
  selectedDate: new Date(),
  setSelectedDate: () => {}
});