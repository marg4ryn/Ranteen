import React, { createContext, useState } from 'react';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const value = {
    menus,
    setMenus,
    selectedDate,
    setSelectedDate
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};