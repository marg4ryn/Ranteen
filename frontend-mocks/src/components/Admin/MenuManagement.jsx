import React, { useState, useContext } from 'react';
import { MenuContext } from '../../contexts/MenuContext';
import { mockDishes } from '../../data/mockDishes';
import './MenuManagement.css';

const MenuManagement = () => {
  const { menus, setMenus } = useContext(MenuContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [availableDishes, setAvailableDishes] = useState([...mockDishes]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  
  // Find menu for selected date
  const findMenuForDate = (date) => {
    return menus.find(menu => menu.date === date);
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    const menu = findMenuForDate(newDate);
    if (menu) {
      setSelectedMenu(menu);
      setSelectedDishes(menu.dishes);
      
      // Update available dishes
      const menuDishIds = menu.dishes.map(dish => dish.id);
      setAvailableDishes(mockDishes.filter(dish => !menuDishIds.includes(dish.id)));
    } else {
      setSelectedMenu(null);
      setSelectedDishes([]);
      setAvailableDishes([...mockDishes]);
    }
  };
  
  // Add dish to menu
  const addDishToMenu = (dish) => {
    setSelectedDishes([...selectedDishes, dish]);
    setAvailableDishes(availableDishes.filter(d => d.id !== dish.id));
  };
  
  // Remove dish from menu
  const removeDishFromMenu = (dish) => {
    setSelectedDishes(selectedDishes.filter(d => d.id !== dish.id));
    setAvailableDishes([...availableDishes, dish].sort((a, b) => a.id - b.id));
  };
  
  // Save menu
  const saveMenu = () => {
    if (selectedDishes.length === 0) {
      alert('Dodaj co najmniej jedno danie do menu.');
      return;
    }
    
    const newMenu = {
      id: selectedMenu ? selectedMenu.id : `menu-${Date.now()}`,
      date: selectedDate,
      dishes: selectedDishes
    };
    
    if (selectedMenu) {
      // Update existing menu
      setMenus(menus.map(menu => menu.id === selectedMenu.id ? newMenu : menu));
    } else {
      // Add new menu
      setMenus([...menus, newMenu]);
    }
    
    alert('Menu zostało zapisane!');
  };
  
  // Delete menu
  const deleteMenu = () => {
    if (!selectedMenu) return;
    
    if (window.confirm('Czy na pewno chcesz usunąć to menu?')) {
      setMenus(menus.filter(menu => menu.id !== selectedMenu.id));
      setSelectedMenu(null);
      setSelectedDishes([]);
      setAvailableDishes([...mockDishes]);
      alert('Menu zostało usunięte!');
    }
  };
  
  return (
    <div className="menu-management-container">
      <h2>Zarządzanie menu</h2>
      
      <div className="date-selector">
        <label htmlFor="menu-date">Wybierz datę:</label>
        <input
          type="date"
          id="menu-date"
          value={selectedDate}
          onChange={handleDateChange}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="menu-editor">
        <div className="available-dishes">
          <h3>Dostępne dania</h3>
          
          {availableDishes.length === 0 ? (
            <p className="no-dishes">Wszystkie dania zostały już dodane do menu.</p>
          ) : (
            <ul className="dish-list">
              {availableDishes.map(dish => (
                <li key={dish.id} className="dish-item">
                  <div className="dish-info">
                    <span className="dish-name">{dish.name}</span>
                    <span className="dish-category">{dish.category}</span>
                  </div>
                  <button 
                    className="add-dish-btn"
                    onClick={() => addDishToMenu(dish)}
                  >
                    Dodaj
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="selected-dishes">
          <h3>Menu na dzień {selectedDate}</h3>
          
          {selectedDishes.length === 0 ? (
            <p className="no-dishes">Brak dań w menu. Dodaj dania z listy dostępnych.</p>
          ) : (
            <ul className="dish-list">
              {selectedDishes.map(dish => (
                <li key={dish.id} className="dish-item">
                  <div className="dish-info">
                    <span className="dish-name">{dish.name}</span>
                    <span className="dish-category">{dish.category}</span>
                  </div>
                  <button 
                    className="remove-dish-btn"
                    onClick={() => removeDishFromMenu(dish)}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="menu-actions">
        <button 
          className="save-menu-btn"
          onClick={saveMenu}
        >
          {selectedMenu ? 'Aktualizuj menu' : 'Zapisz menu'}
        </button>
        
        {selectedMenu && (
          <button 
            className="delete-menu-btn"
            onClick={deleteMenu}
          >
            Usuń menu
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;