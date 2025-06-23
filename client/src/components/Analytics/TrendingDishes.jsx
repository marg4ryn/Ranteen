import React from 'react';

const TrendingDishes = ({ dishes }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#00b894'; // Green
    if (rating >= 4.0) return '#6c5ce7'; // Purple
    if (rating >= 3.5) return '#fdcb6e'; // Yellow
    if (rating >= 3.0) return '#ff7675'; // Light red
    return '#ff4757'; // Red
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(2) : '0.00';
  };

  if (!dishes || dishes.length === 0) {
    return (
      <div className="trending-dishes">
        <div className="no-data">
          <p>No trending dishes data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-dishes">
      <div className="dishes-list">
        {dishes.map((dish, index) => (
          <div key={dish._id} className="dish-item">
            <div className="rank">
              <span className="rank-number">#{index + 1}</span>
            </div>
            
            <div className="dish-info">
              <h4 className="dish-name">{dish.dishName}</h4>
              <span className="dish-category">{dish.dishCategory}</span>
            </div>
            
            <div className="dish-stats">
              <div className="rating-display">
                <span 
                  className="rating-value"
                  style={{ color: getRatingColor(dish.averageRating) }}
                >
                  ⭐ {formatRating(dish.averageRating)}
                </span>
                <span className="rating-count">
                  ({dish.totalRatings} rating{dish.totalRatings !== 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="rating-mini-distribution">
                {[1, 2, 3, 4, 5].map(rating => {
                  const count = dish.ratingDistribution[rating] || 0;
                  const percentage = dish.totalRatings > 0 ? (count / dish.totalRatings) * 100 : 0;
                  
                  return (
                    <div
                      key={rating}
                      className="mini-bar"
                      style={{ 
                        height: `${Math.max(percentage, 2)}%`,
                        backgroundColor: getRatingColor(rating)
                      }}
                      title={`${rating} stars: ${count} ratings (${percentage.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingDishes;
