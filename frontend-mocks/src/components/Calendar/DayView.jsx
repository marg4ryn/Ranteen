import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MenuContext } from '../../contexts/MenuContext';
import DishList from '../Dishes/DishList';
import './DayView.css';

const DayView = ({ compact = false }) => {
  const { menus, selectedDate, setSelectedDate } = useContext(MenuContext);
  const { date: dateParam } = useParams();
  const [menu, setMenu] = useState(null);
  
  useEffect(() => {
    // Jeśli data jest podana w URL, użyj jej
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      // Użyj funkcji porównującej daty zamiast bezpośrednio ustawiać stan
      const newDate = new Date(year, month - 1, day);
      if (selectedDate.toDateString() !== newDate.toDateString()) {
        setSelectedDate(newDate);
      }
    }
    
    // Format wybranej daty jako YYYY-MM-DD
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    // Znajdź menu dla wybranej daty
    const foundMenu = menus.find(m => m.date === formattedDate);
    setMenu(foundMenu);
  }, [dateParam, menus, selectedDate, setSelectedDate]);
  
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