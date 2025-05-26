import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuContext } from '../../contexts/MenuContext';
import DayView from './DayView';
import './Calendar.css';

const Calendar = () => {
  const { menus, selectedDate, setSelectedDate } = useContext(MenuContext);
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get first day of month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Helper to format date as YYYY-MM-DD
  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  // Check if a date has menu
  const hasMenu = (day) => {
    const dateStr = formatDate(currentYear, currentMonth, day);
    return menus.some(menu => menu.date === dateStr);
  };
  
  // Handle day click
  const handleDayClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    navigate(`/day/${formatDate(currentYear, currentMonth, day)}`);
  };
  
  // Previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Month names
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];
  
  // Day names
  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.toDateString() === new Date().toDateString();
    const hasMenuForDay = hasMenu(day);
    
    calendarDays.push(
      <div 
        key={`day-${day}`} 
        className={`calendar-day ${isToday ? 'today' : ''} ${hasMenuForDay ? 'has-menu' : ''}`}
        onClick={() => handleDayClick(day)}
      >
        <span className="day-number">{day}</span>
        {hasMenuForDay && <span className="menu-indicator">🍽️</span>}
      </div>
    );
  }
  
  // Check if today's date is selected
  const isTodaySelected = new Date().toDateString() === selectedDate.toDateString();
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      
      <div className="calendar-days-header">
        {dayNames.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
      </div>
      
      <div className="calendar-days">
        {calendarDays}
      </div>
      
      <div className="today-menu">
        <h3>{isTodaySelected ? "Dzisiejsze danie" : "Wybrane danie"}</h3>
        <DayView compact={true} />
      </div>
    </div>
  );
};

export default Calendar;