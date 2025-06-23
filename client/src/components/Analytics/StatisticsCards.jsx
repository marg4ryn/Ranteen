import React from 'react';

const StatisticsCards = ({ statistics, period }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === "All time") return "All time";
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const cards = [
    {
      title: 'Total Ratings',
      value: formatNumber(statistics.totalRatings),
      icon: '⭐',
      color: 'blue'
    },
    {
      title: 'Average Rating',
      value: statistics.averageRating ? statistics.averageRating.toFixed(2) : '0.00',
      icon: '📊',
      color: 'green'
    },
    {
      title: 'Active Students',
      value: formatNumber(statistics.uniqueStudentsCount),
      icon: '👥',
      color: 'purple'
    },
    {
      title: 'Rated Dishes',
      value: formatNumber(statistics.uniqueDishesCount),
      icon: '🍽️',
      color: 'orange'
    }
  ];

  return (
    <div className="statistics-section">
      <div className="period-info">
        <h3>Period: {formatDate(period.startDate)} - {formatDate(period.endDate)}</h3>
      </div>
      
      <div className="statistics-cards">
        {cards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {statistics.firstRating && statistics.lastRating && (
        <div className="additional-stats">
          <p>
            <strong>Data Range:</strong> {formatDate(statistics.firstRating)} to {formatDate(statistics.lastRating)}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatisticsCards;
