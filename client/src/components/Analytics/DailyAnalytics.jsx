import React, { useState, useEffect, useMemo } from 'react';
import analyticsService from '../../services/analyticsService';
import RatingDistributionChart from './RatingDistributionChart';
import TrendingDishes from './TrendingDishes';

const DailyAnalytics = ({ date, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (date) {
      loadDailyAnalytics();
    }
  }, [date, selectedCategory]);

  const loadDailyAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedCategory) params.category = selectedCategory;

      const analyticsData = await analyticsService.getDailyAnalytics(date, params);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading daily analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCategories = () => {
    if (!analytics?.dishAnalytics) return [];
    const categories = [...new Set(analytics.dishAnalytics.map(dish => dish.dishCategory))];
    return categories.sort();
  };

  // Enhanced analytics calculations
  const dayInsights = useMemo(() => {
    if (!analytics) return null;

    const { statistics, dishAnalytics } = analytics;
    
    // Performance categorization
    const getPerformanceCategory = (rating) => {
      if (rating >= 4.5) return 'excellent';
      if (rating >= 4.0) return 'good';
      if (rating >= 3.5) return 'average';
      if (rating >= 3.0) return 'poor';
      return 'critical';
    };

    const performanceCategories = dishAnalytics.reduce((acc, dish) => {
      const category = getPerformanceCategory(dish.averageRating);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Category analysis
    const categoryStats = dishAnalytics.reduce((acc, dish) => {
      const cat = dish.dishCategory;
      if (!acc[cat]) {
        acc[cat] = { 
          count: 0, 
          totalRating: 0, 
          totalRatings: 0,
          dishes: []
        };
      }
      acc[cat].count++;
      acc[cat].totalRating += dish.averageRating;
      acc[cat].totalRatings += dish.totalRatings;
      acc[cat].dishes.push(dish);
      return acc;
    }, {});

    Object.keys(categoryStats).forEach(cat => {
      categoryStats[cat].averageRating = categoryStats[cat].totalRating / categoryStats[cat].count;
    });

    return {
      performanceCategories,
      categoryStats,
      topPerformer: dishAnalytics.reduce((top, dish) => 
        dish.averageRating > (top?.averageRating || 0) ? dish : top, null),
      mostPopular: dishAnalytics.reduce((popular, dish) => 
        dish.totalRatings > (popular?.totalRatings || 0) ? dish : popular, null),
      averageRating: statistics.averageRating,
      totalRatings: statistics.totalRatings
    };
  }, [analytics]);

  if (loading) {
    return (
      <div className="daily-analytics-modal">
        <div className="modal-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading daily analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-analytics-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Error Loading Analytics</h2>
            <button onClick={onClose} className="close-button">&times;</button>
          </div>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadDailyAnalytics} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableCategories = getAvailableCategories();

  return (
    <div className="daily-analytics-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Analytics for {new Date(date).toLocaleDateString()}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="analytics-controls">
          <div className="control-group">
            <label htmlFor="categoryFilter">Filter by Category:</label>
            <select 
              id="categoryFilter"
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor="chartType">Chart Type:</label>
            <select 
              id="chartType"
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">📊 Bar Chart</option>
              <option value="doughnut">🍩 Doughnut Chart</option>
            </select>
          </div>
        </div>

        {analytics && dayInsights && (
          <div className="daily-analytics-content">
            {/* Day Performance Summary */}
            <div className="day-performance-summary">
              <div className="performance-header">
                <h3>📈 Day Performance Summary</h3>
                <div className={`performance-badge ${dayInsights.averageRating >= 4.5 ? 'excellent' : 
                                                      dayInsights.averageRating >= 4.0 ? 'good' : 
                                                      dayInsights.averageRating >= 3.5 ? 'average' : 'poor'}`}>
                  {dayInsights.averageRating >= 4.5 ? '🌟 Excellent' : 
                   dayInsights.averageRating >= 4.0 ? '👍 Good' : 
                   dayInsights.averageRating >= 3.5 ? '👌 Average' : '⚠️ Needs Attention'}
                </div>
              </div>
              
              <div className="performance-insights">
                <div className="insight-cards">
                  <div className="insight-card highlight">
                    <div className="insight-icon">🏆</div>
                    <div className="insight-content">
                      <h4>Top Performer</h4>
                      <p>{dayInsights.topPerformer?.dishName || 'No data'}</p>
                      <span className="insight-value">
                        {dayInsights.topPerformer?.averageRating?.toFixed(2) || '0.00'} ⭐
                      </span>
                    </div>
                  </div>
                  
                  <div className="insight-card highlight">
                    <div className="insight-icon">🔥</div>
                    <div className="insight-content">
                      <h4>Most Popular</h4>
                      <p>{dayInsights.mostPopular?.dishName || 'No data'}</p>
                      <span className="insight-value">
                        {dayInsights.mostPopular?.totalRatings || 0} ratings
                      </span>
                    </div>
                  </div>
                  
                  <div className="insight-card">
                    <div className="insight-icon">📊</div>
                    <div className="insight-content">
                      <h4>Performance Breakdown</h4>
                      <div className="performance-breakdown">
                        <div className="perf-item excellent">
                          <span>Excellent: {dayInsights.performanceCategories.excellent || 0}</span>
                        </div>
                        <div className="perf-item good">
                          <span>Good: {dayInsights.performanceCategories.good || 0}</span>
                        </div>
                        <div className="perf-item average">
                          <span>Average: {dayInsights.performanceCategories.average || 0}</span>
                        </div>
                        <div className="perf-item poor">
                          <span>Poor: {dayInsights.performanceCategories.poor || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall daily statistics */}
            <div className="overall-stats-section">
              <h3>📊 Daily Overview</h3>
              <div className="daily-stats-cards">
                <div className="stat-card blue">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h4>{analytics.overallStats.totalRatings.toLocaleString()}</h4>
                    <p>Total Ratings</p>
                  </div>
                </div>
                
                <div className="stat-card green">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <h4>{analytics.overallStats.averageRating?.toFixed(2) || '0.00'}</h4>
                    <p>Average Rating</p>
                  </div>
                </div>
                
                <div className="stat-card purple">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h4>{analytics.overallStats.uniqueStudentsCount}</h4>
                    <p>Active Students</p>
                  </div>
                </div>
                
                <div className="stat-card orange">
                  <div className="stat-icon">🍽️</div>
                  <div className="stat-content">
                    <h4>{analytics.menu.filteredDishes}</h4>
                    <p>Rated Dishes</p>
                  </div>
                </div>

                {Object.keys(dayInsights.categoryStats).length > 1 && (
                  <div className="stat-card indigo">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <h4>{Object.keys(dayInsights.categoryStats).length}</h4>
                      <p>Categories</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Performance */}
            {Object.keys(dayInsights.categoryStats).length > 1 && (
              <div className="category-performance-section">
                <h3>🍽️ Category Performance</h3>
                <div className="category-grid">
                  {Object.entries(dayInsights.categoryStats).map(([category, stats]) => (
                    <div key={category} className="category-card">
                      <div className="category-header">
                        <h4>{category}</h4>
                        <span className="category-count">{stats.count} dishes</span>
                      </div>
                      <div className="category-stats">
                        <div className="category-rating">
                          <span className="rating-value">{stats.averageRating.toFixed(2)} ⭐</span>
                          <span className="rating-label">Avg Rating</span>
                        </div>
                        <div className="category-volume">
                          <span className="volume-value">{stats.totalRatings}</span>
                          <span className="volume-label">Total Ratings</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="analytics-grid">
              {/* Rating distribution for the day */}
              <div className="analytics-card">
                <div className="card-header">
                  <h3>📊 Daily Rating Distribution</h3>
                  <div className="chart-type-indicator">
                    {chartType === 'doughnut' ? '🍩' : '📊'} {chartType}
                  </div>
                </div>
                <RatingDistributionChart 
                  distribution={analytics.overallStats.ratingDistribution}
                  totalRatings={analytics.overallStats.totalRatings}
                  chartType={chartType}
                />
              </div>

              {/* Dish performance for the day */}
              <div className="analytics-card">
                <h3>🏆 Dish Performance Ranking</h3>
                <TrendingDishes dishes={analytics.dishAnalytics} />
              </div>
            </div>

            {/* Detailed dish breakdown */}
            {analytics.dishAnalytics && analytics.dishAnalytics.length > 0 && (
              <div className="dish-breakdown-section">
                <h3>Detailed Dish Breakdown</h3>
                <div className="dish-breakdown-grid">
                  {analytics.dishAnalytics.map((dish, index) => (
                    <div key={dish._id} className="dish-breakdown-item">
                      <div className="dish-header">
                        <h4>{dish.dishName}</h4>
                        <span className="dish-category">{dish.dishCategory}</span>
                      </div>
                      
                      <div className="dish-stats">
                        <div className="main-stats">
                          <span className="rating">
                            ⭐ {dish.averageRating?.toFixed(2) || '0.00'}
                          </span>
                          <span className="count">
                            {dish.totalRatings} rating{dish.totalRatings !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="rating-breakdown">
                          {[5, 4, 3, 2, 1].map(rating => {
                            const count = dish.ratingDistribution[rating] || 0;
                            const percentage = dish.totalRatings > 0 ? (count / dish.totalRatings) * 100 : 0;
                            
                            return (
                              <div key={rating} className="rating-row">
                                <span className="star-label">{rating}★</span>
                                <div className="rating-bar-small">
                                  <div 
                                    className="rating-fill-small"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="rating-count-small">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!analytics.dishAnalytics || analytics.dishAnalytics.length === 0) && (
              <div className="no-data">
                <p>No dish ratings available for this date{selectedCategory ? ` in the ${selectedCategory} category` : ''}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAnalytics;
