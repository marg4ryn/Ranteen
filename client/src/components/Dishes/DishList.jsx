import React from 'react';
import DishCard from './DishCard';
import './DishList.css';

const DishList = ({ dishes, date, compact = false, isFuture = false }) => {
  // Group dishes by category
  const groupedDishes = dishes.reduce((acc, dish) => {
    if (!acc[dish.category]) {
      acc[dish.category] = [];
    }
    acc[dish.category].push(dish);
    return acc;
  }, {});
  
  return (
    <div className={`dish-list ${compact ? 'compact' : ''}`}>
      {Object.entries(groupedDishes).map(([category, categoryDishes]) => (
        <div key={category} className="category-section">
          <h3 className="category-title">{category}</h3>
          <div className="category-dishes">
            {categoryDishes.map(dish => (
              <DishCard 
                key={dish.id} 
                dish={dish} 
                date={date}
                compact={compact}
                isFuture={isFuture}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DishList;