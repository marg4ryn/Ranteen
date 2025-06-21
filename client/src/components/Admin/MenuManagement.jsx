import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getMenuByDate, updateMenu, deleteMenu, createMenu } from '../../services/menuService';
import dishApi from '../../services/dishService';
import './MenuManagement.css';

// Helper do formatowania daty
const toDateString = (date) => new Date(date).toISOString().split('T')[0];

const MenuManagement = () => {
  // --- Stany komponentu ---
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [selectedMenu, setSelectedMenu] = useState(null); // Przechowuje całe menu z API (z _id)
  const [allDishes, setAllDishes] = useState([]); // Lista wszystkich dań z API
  const [selectedDishes, setSelectedDishes] = useState([]); // Dania aktualnie wybrane do menu
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Pobieranie danych z API ---

  // 1. Pobierz listę wszystkich dostępnych dań (uruchamiane raz przy montowaniu)
  useEffect(() => {
    const fetchAllDishes = async () => {
      try {
        const dishesFromApi = await dishApi.getAll();
        setAllDishes(dishesFromApi || []);
      } catch (err) {
        setError(`Nie udało się pobrać listy dań: ${err.message}`);
      }
    };
    fetchAllDishes();
  }, []);

  // 2. Funkcja do pobierania menu dla wybranej daty
  const loadMenuForDate = useCallback(async (dateString) => {
    setIsLoading(true);
    setError(null);
    try {
      const menuForDate = await getMenuByDate(dateString);
      // Jeśli menu na dany dzień istnieje
      setSelectedMenu(menuForDate);
      setSelectedDishes(menuForDate.dishes || []);
    } catch (err) {
      // Jeśli API zwróci 404 (Not Found), to znaczy, że menu na ten dzień nie istnieje
      if (err.message.includes('Not Found')) {
        setSelectedMenu(null);
        setSelectedDishes([]);
      } else {
        setError(`Nie udało się pobrać menu: ${err.message}`);
      }
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

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
    const dishIds = selectedDishes.map(dish => dish._id);
    const menuData = {
      date: selectedDate,
      dishes: dishIds,
    };

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
    <div className="menu-management-container">
      <h2>Zarządzanie menu</h2>
      
      <div className="date-selector">
        <label htmlFor="menu-date">Wybierz datę:</label>
        <input type="date" id="menu-date" value={selectedDate} onChange={handleDateChange} />
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
              <h3>Menu na dzień {selectedDate}</h3>
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
  );
};

export default MenuManagement;