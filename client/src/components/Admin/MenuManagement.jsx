import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getMenuByDate, updateMenu, deleteMenu, createMenu } from '../../services/menuService';
import dishApi from '../../services/dishService';
import Calendar from '../Calendar/Calendar';
import { MenuContext } from '../../contexts/MenuContext';
import './MenuManagement.css';

// Helper do formatowania daty
const toDateString = (date) => new Date(date).toISOString().split('T')[0];

const MenuManagement = () => {
  // --- Stany komponentu ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMenu, setSelectedMenu] = useState(null); // Przechowuje całe menu z API (z _id)
  const [allDishes, setAllDishes] = useState([]); // Lista wszystkich dań z API
  const [selectedDishes, setSelectedDishes] = useState([]); // Dania aktualnie wybrane do menu
  const [menus, setMenus] = useState([]); // For Calendar component
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Pobieranie danych z API ---

  // 1. Pobierz listę wszystkich dostępnych dań (uruchamiane raz przy montowaniu)
  useEffect(() => {
    const fetchAllDishes = async () => {
      try {
        const response = await dishApi.getAll({ limit: 100 }); 
        setAllDishes(response.dishes || []);
      } catch (err) {
        setError(`Nie udało się pobrać listy dań: ${err.message}`);
      }
    };
    fetchAllDishes();
  }, []);

  // 2. Funkcja do pobierania menu dla wybranej daty
  const loadMenuForDate = useCallback(async (date) => {
    setIsLoading(true);
    setError(null);
    try {
      const dateString = toDateString(date);
      const menuForDate = await getMenuByDate(dateString);
      
      // Sprawdź czy to jest odpowiedź z pustymi daniami (brak menu na dany dzień)
      // lub czy to jest pełne menu z _id
      if (menuForDate && menuForDate._id) {
        // Pełne menu istnieje
        setSelectedMenu(menuForDate);
        setSelectedDishes(menuForDate.dishes || []);
      } else if (menuForDate && Array.isArray(menuForDate.dishes) && menuForDate.dishes.length === 0) {
        // Backend zwrócił { dishes: [] } - brak menu na ten dzień
        setSelectedMenu(null);
        setSelectedDishes([]);
      } else {
        // Nieoczekiwany format odpowiedzi
        setSelectedMenu(null);
        setSelectedDishes([]);
      }
    } catch (err) {
      // Obsługa błędów sieciowych lub innych
      setError(`Nie udało się pobrać menu: ${err.message}`);
      setSelectedMenu(null);
      setSelectedDishes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Uruchom pobieranie menu, gdy zmieni się data
  useEffect(() => {
    loadMenuForDate(selectedDate);
  }, [selectedDate, loadMenuForDate]);

  // --- Logika pomocnicza ---

  // Oblicz, które dania są dostępne do dodania (te, które nie są już w menu)
  // Używamy useMemo dla optymalizacji, aby nie przeliczać tego przy każdym renderze
  const availableDishes = useMemo(() => {
    if (!Array.isArray(allDishes)) return [];
    const selectedDishIds = new Set(selectedDishes.map(dish => dish._id));
    return allDishes.filter(dish => !selectedDishIds.has(dish._id));
  }, [allDishes, selectedDishes]);

  // --- Obsługa zdarzeń (Handler'y) ---

  const addDishToMenu = (dish) => {
    setSelectedDishes(prev => [...prev, dish]);
  };
  
  const removeDishFromMenu = (dish) => {
    setSelectedDishes(prev => prev.filter(d => d._id !== dish._id));
  };
  
  const saveMenu = async () => {
    if (selectedDishes.length === 0) {
      alert('Menu musi zawierać co najmniej jedno danie.');
      return;
    }
    
    // Przygotowujemy dane do wysłania - potrzebujemy tylko ID dań
    const dishIds = selectedDishes
      .filter(dish => dish._id) // odfiltruj undefined
      .map(dish => dish._id);
    const menuData = {
      date: toDateString(selectedDate),
      dishes: dishIds,
    };
    console.log('Wysyłam do API:', menuData); 
    console.log('Stan selectedDishes:', selectedDishes);
    setIsLoading(true);
    try {
      if (selectedMenu) {
        // Aktualizacja istniejącego menu
        await updateMenu(selectedMenu._id, menuData);
        alert('Menu zostało zaktualizowane!');
      } else {
        // Tworzenie nowego menu
        await createMenu(menuData);
        alert('Menu zostało zapisane!');
      }
      // Po udanej operacji odświeżamy dane z serwera
      loadMenuForDate(selectedDate);
    } catch (err) {
      alert(`Błąd zapisu: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeMenu = async () => {
    if (!selectedMenu) return;
    
    if (window.confirm('Czy na pewno chcesz usunąć to menu?')) {
      setIsLoading(true);
      try {
        await deleteMenu(selectedMenu._id);
        alert('Menu zostało usunięte!');
        // Resetujemy stan do "tworzenia nowego menu"
        setSelectedMenu(null);
        setSelectedDishes([]);
      } catch (err) {
        alert(`Błąd podczas usuwania: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <MenuContext.Provider value={{ selectedDate, setSelectedDate, menus, setMenus }}>
      <div className="menu-management-container">
        <h2>Zarządzanie menu</h2>
        
        <div className="calendar-section">
          <h3>Wybierz datę z kalendarza:</h3>
          <Calendar showDayView={false} />
        </div>

        {isLoading && <p>Ładowanie...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!isLoading && !error && (
          <>
            <div className="menu-editor">
              <div className="available-dishes">
                <h3>Dostępne dania</h3>
                {availableDishes.length > 0 ? (
                  <ul className="dish-list">
                    {availableDishes.map(dish => (
                      <li key={dish._id} className="dish-item">
                        <div className="dish-info">
                          <span className="dish-name">{dish.name}</span>
                          <span className="dish-category">{dish.category}</span>
                        </div>
                        <button className="add-dish-btn" onClick={() => addDishToMenu(dish)}>Dodaj</button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="no-dishes">Brak dań do dodania.</p>}
              </div>
              
              <div className="selected-dishes">
                <h3>Menu na dzień {selectedDate.toLocaleDateString('pl-PL')}</h3>
                {selectedDishes.length > 0 ? (
                  <ul className="dish-list">
                    {selectedDishes.map(dish => (
                      <li key={dish._id} className="dish-item">
                         <div className="dish-info">
                           <span className="dish-name">{dish.name}</span>
                           <span className="dish-category">{dish.category}</span>
                         </div>
                         <button className="remove-dish-btn" onClick={() => removeDishFromMenu(dish)}>Usuń</button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="no-dishes">Brak dań w menu. Dodaj dania z listy.</p>}
              </div>
            </div>
            
            <div className="menu-actions">
              <button className="save-menu-btn" onClick={saveMenu} disabled={isLoading}>
                {selectedMenu ? 'Aktualizuj menu' : 'Zapisz nowe menu'}
              </button>
              {selectedMenu && (
                <button className="delete-menu-btn" onClick={removeMenu} disabled={isLoading}>
                  Usuń menu
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </MenuContext.Provider>
  );
};

export default MenuManagement;