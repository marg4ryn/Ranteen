import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MenuContext } from '../../contexts/MenuContext';
import { getMenuByDate } from '../../services/menuService'; // Poprawiony import
import DishList from '../Dishes/DishList';
import './DayView.css';

const DayView = ({ compact = false }) => {
  const { selectedDate, setSelectedDate, setMenus } = useContext(MenuContext); // Dodano setMenus
  const { date: dateParam } = useParams();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null); // Dodano obsługę błędu

  const formatDate = (date) => date.toISOString().split('T')[0]; // yyyy-mm-dd

  useEffect(() => {
    const fetchMenu = async (date) => {
      try {
        const dateString = formatDate(date);
        const data = await getMenuByDate(dateString); // Poprawione wywołanie
        const menusArray = data ? [data] : [];
        setMenus(menusArray);

        const foundMenu = menusArray.find(m => m.date === dateString);
        setMenu(foundMenu);
      } catch (err) {
        const msg = err.message || 'Unknown error';
        if (msg.includes('Not Found') || msg.includes('404')) {
          setMenus([]);
          setMenu(undefined);
        } else {
          setError(msg);
          setMenus([]);
          setMenu(undefined);
        }
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
  }, [dateParam]);
  
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