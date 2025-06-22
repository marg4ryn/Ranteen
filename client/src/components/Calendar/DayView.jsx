import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MenuContext } from '../../contexts/MenuContext';
import { getMenuByDate } from '../../services/menuService'; // Poprawiony import
import DishList from '../Dishes/DishList';
import './DayView.css';

const DayView = ({ compact = false }) => {
  const { selectedDate, setSelectedDate } = useContext(MenuContext); // Removed setMenus
  const { date: dateParam } = useParams();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (date) => date.toISOString().split('T')[0]; // yyyy-mm-dd

  useEffect(() => {
    const fetchMenu = async (date) => {
      try {
        const dateString = formatDate(date);
        const data = await getMenuByDate(dateString);
        
        // Sprawdź czy to jest pełne menu z _id czy odpowiedź z pustymi daniami
        if (data && data._id) {
          // Pełne menu istnieje
          setMenu(data);
        } else if (data && Array.isArray(data.dishes) && data.dishes.length === 0) {
          // Backend zwrócił { dishes: [] } - brak menu na ten dzień
          setMenu(null);
        } else {
          // Nieoczekiwany format odpowiedzi
          setMenu(null);
        }
        setError(null);
      } catch (err) {
        const msg = err.message || 'Unknown error';
        setError(msg);
        setMenu(null);
      }
    };

    // Obsługa daty z URL
    let effectiveDate = selectedDate;
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);

      if (selectedDate.toDateString() !== parsedDate.toDateString()) {
        setSelectedDate(parsedDate);
        effectiveDate = parsedDate;
      }
    }

    fetchMenu(effectiveDate);
  }, [dateParam, selectedDate]);
  
  // Format daty do wyświetlenia
  const formatDateForDisplay = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
  };
  
  // Sprawdź, czy wybrana data to dzisiaj
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  // Sprawdź, czy wybrana data jest w przyszłości
  const isFuture = selectedDate > new Date();
  
  // Sprawdź, czy wybrana data to jutro
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = selectedDate.toDateString() === tomorrow.toDateString();
  
  // Pojutrze
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const isDayAfterTomorrow = selectedDate.toDateString() === dayAfterTomorrow.toDateString();
  
  // Pobierz tytuł dnia
  const getDayTitle = () => {
    if (isToday) return "Dzisiejsze danie";
    if (isTomorrow) return "Jutrzejsze danie";
    if (isDayAfterTomorrow) return "Danie pojutrze";
    if (isFuture) return "Zaplanowane danie";
    return "Danie z dnia";
  };
  
  return (
    <div className={`day-view ${compact ? 'compact' : ''}`}>
      <h2>{getDayTitle()} {formatDateForDisplay(selectedDate)}</h2>
      
      {menu ? (
        <>
          <DishList dishes={menu.dishes} date={selectedDate} compact={compact} isFuture={isFuture} />
        </>
      ) : (
        <div className="no-menu">
          <p>Brak zaplanowanego menu na ten dzień.</p>
        </div>
      )}
    </div>
  );
};

export default DayView;