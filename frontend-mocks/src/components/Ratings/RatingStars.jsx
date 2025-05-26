import React, { useState } from 'react';
import './RatingStars.css';

const RatingStars = ({ value = 0, onChange = null, readOnly = false }) => {
  const [hoverValue, setHoverValue] = useState(0);
  
  // Handle mouse enter
  const handleMouseEnter = (index) => {
    if (!readOnly) {
      setHoverValue(index);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(0);
    }
  };
  
  // Handle click
  const handleClick = (index) => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };
  
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((index) => (
        <span
          key={index}
          className={`star ${(hoverValue || value) >= index ? 'filled' : ''} ${readOnly ? 'readonly' : ''}`}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;