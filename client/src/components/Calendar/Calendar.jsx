import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuContext } from '../../contexts/MenuContext';
import { getMenusByDateRange } from '../../services/menuService';
import DayView from './DayView';
import './Calendar.css';

// Funkcja pomocnicza do formatowania obiektu Date na string 'YYYY-MM-DD'
const toDateString = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const Calendar = ({ showDayView = true }) => {
  const { menus, setMenus, selectedDate, setSelectedDate } = useContext(MenuContext);
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync calendar view with selected date
  useEffect(() => {
    setCurrentMonth(selectedDate.getMonth());
    setCurrentYear(selectedDate.getFullYear());
  }, [selectedDate]);

  useEffect(() => {
    const fetchMenusForMonth = async () => {
      setIsLoading(true);
      setError(null);
      
      // Obliczamy początek i koniec bieżącego miesiąca
      const startDate = toDateString(new Date(currentYear, currentMonth, 1));
      const endDate = toDateString(new Date(currentYear, currentMonth + 1, 0));
      
      try {
        const monthlyMenus = await getMenusByDateRange(startDate, endDate);
        setMenus(monthlyMenus || []);
      } catch (err) {
        console.error('Błąd podczas pobierania menu:', err);
        setError(`Nie udało się pobrać menu: ${err.message}`);
        setMenus([]); // Wyczyść menu w przypadku błędu
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenusForMonth();
  }, [currentMonth, currentYear, setMenus]);

  // Sprawdza, czy dla danego dnia w miesiącu istnieje menu
  const hasMenu = (day) => {
    if (!Array.isArray(menus)) return false;

    const checkDateStr = toDateString(new Date(currentYear, currentMonth, day));
    return menus.some(menu => {
      if (!menu?.date) return false;
      return toDateString(new Date(menu.date)) === checkDateStr;
    });
  };
  
  const handleDayClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };
  
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];
  const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
  
  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Dostosowanie, aby poniedziałek był pierwszym dniem tygodnia (indeks 0)
    firstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const calendarDays = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isToday = toDateString(date) === toDateString(new Date());
      const isSelected = toDateString(date) === toDateString(selectedDate);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      const hasMenuForDay = hasMenu(day);
      
      calendarDays.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''} ${hasMenuForDay ? 'has-menu' : ''}`}
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasMenuForDay && <span className="menu-indicator">🍽️</span>}
        </div>
      );
    }
    return calendarDays;
  }
  
  const isSelectedDateToday = toDateString(selectedDate) === toDateString(new Date());
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} disabled={isLoading}>{"<"}</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} disabled={isLoading}>{">"}</button>
      </div>
      
      <div className="calendar-days-header">
        {dayNames.map(day => <div key={day} className="day-name">{day}</div>)}
      </div>
      
      <div className="calendar-grid-wrapper">
        {isLoading && <div className="loading-overlay"><p>Ładowanie...</p></div>}
        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>
      
      {showDayView && (
        <div className="today-menu">
          <h3>{isSelectedDateToday ? "Menu na dziś" : `Menu na ${selectedDate.toLocaleDateString()}`}</h3>
          <DayView compact={false} />
        </div>
      )}
    </div>
  );
};

export default Calendar;