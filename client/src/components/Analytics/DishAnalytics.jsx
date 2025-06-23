import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import dishService from '../../services/dishService';
import RatingDistributionChart from './RatingDistributionChart';
import DailyAnalyticsChart from './DailyAnalyticsChart';

const DishAnalytics = ({ dishId, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [dish, setDish] = useState(null);
  const [groupBy, setGroupBy] = useState('overall');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dishId) {
      loadDishAnalytics();
    }
  }, [dishId, groupBy, dateRange]);

  const loadDishAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { groupBy };
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const analyticsData = await analyticsService.getDishAnalytics(dishId, params);
      setAnalytics(analyticsData);
      setDish(analyticsData.dish);
    } catch (err) {
      setError(err.message);
      console.error('Error loading dish analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearDateRange = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return (
      <div className="dish-analytics-modal">
        <div className="modal-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dish analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dish-analytics-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Error Loading Analytics</h2>
            <button onClick={onClose} className="close-button">&times;</button>
          </div>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadDishAnalytics} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dish-analytics-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Analytics for {dish?.name}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="analytics-controls">
          <div className="control-group">
            <label>View:</label>
            <select 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="overall">Overall Analytics</option>
              <option value="day">Daily Breakdown</option>
            </select>
          </div>

          <div className="date-controls">
            <div className="date-input-group">
              <label htmlFor="dishStartDate">Start Date:</label>
              <input
                type="date"
                id="dishStartDate"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="dishEndDate">End Date:</label>
              <input
                type="date"
                id="dishEndDate"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
            <button onClick={clearDateRange} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        <div className="dish-info">
          <h3>{dish?.name}</h3>
          <p><strong>Category:</strong> {dish?.category}</p>
        </div>

        <div className="analytics-content">
          {analytics?.analytics && analytics.analytics.length > 0 ? (
            groupBy === 'overall' ? (
              <div className="overall-analytics">
                <div className="analytics-card">
                  <h3>Rating Distribution</h3>
                  <RatingDistributionChart 
                    distribution={analytics.analytics[0].ratingDistribution}
                    totalRatings={analytics.analytics[0].totalRatings}
                  />
                </div>
                
                <div className="summary-stats">
                  <div className="stat-item">
                    <h4>Average Rating</h4>
                    <span className="stat-value">
                      {analytics.analytics[0].averageRating?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <h4>Total Ratings</h4>
                    <span className="stat-value">
                      {analytics.analytics[0].totalRatings || 0}
                    </span>
                  </div>
                  {analytics.analytics[0].firstRating && (
                    <div className="stat-item">
                      <h4>First Rating</h4>
                      <span className="stat-value">
                        {new Date(analytics.analytics[0].firstRating).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {analytics.analytics[0].lastRating && (
                    <div className="stat-item">
                      <h4>Last Rating</h4>
                      <span className="stat-value">
                        {new Date(analytics.analytics[0].lastRating).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="daily-analytics">
                <div className="analytics-card">
                  <h3>Daily Rating Trends</h3>
                  <DailyAnalyticsChart 
                    dailyTrends={analytics.analytics.map(day => ({
                      ...day,
                      date: day._id
                    }))}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="no-data">
              <p>No rating data available for this dish in the selected period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishAnalytics;
