import React, { useState, useEffect } from 'react';
import analyticsService from '../../services/analyticsService';
import RatingDistributionChart from './RatingDistributionChart';
import TrendingDishes from './TrendingDishes';
import DailyAnalyticsChart from './DailyAnalyticsChart';
import StatisticsCards from './StatisticsCards';
import './Analytics.css';

const Analytics = () => {
  const [statistics, setStatistics] = useState(null);
  const [trendingDishes, setTrendingDishes] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [chartSettings, setChartSettings] = useState({
    distributionType: 'bar', // 'bar' or 'doughnut'
    trendsType: 'line' // 'line', 'rating-bar', 'volume-bar', or 'combined'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedDateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedDateRange.startDate) params.startDate = selectedDateRange.startDate;
      if (selectedDateRange.endDate) params.endDate = selectedDateRange.endDate;

      const [statsData, trendingData] = await Promise.all([
        analyticsService.getRatingStatistics(params),
        analyticsService.getTrendingDishes({ ...params, limit: 10 })
      ]);

      setStatistics(statsData);
      setTrendingDishes(trendingData.trendingDishes);
    } catch (err) {
      setError(err.message);
      console.error('Error loading analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setSelectedDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChartTypeChange = (chartType, value) => {
    setChartSettings(prev => ({
      ...prev,
      [chartType]: value
    }));
  };

  const clearDateRange = () => {
    setSelectedDateRange({
      startDate: '',
      endDate: ''
    });
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={loadAnalyticsData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Rating Analytics Dashboard</h1>
        <div className="controls-container">
          <div className="date-range-controls">
            <div className="date-input-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={selectedDateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={selectedDateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              />
            </div>
            <button onClick={clearDateRange} className="clear-button">
              Clear Range
            </button>
          </div>
          
          <div className="chart-controls">
            <div className="control-group">
              <label>Distribution Chart:</label>
              <select 
                value={chartSettings.distributionType}
                onChange={(e) => handleChartTypeChange('distributionType', e.target.value)}
              >
                <option value="bar">Bar Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
            <div className="control-group">
              <label>Trends Chart:</label>
              <select 
                value={chartSettings.trendsType}
                onChange={(e) => handleChartTypeChange('trendsType', e.target.value)}
              >
                <option value="line">📈 Line Chart (Combined)</option>
                <option value="rating-bar">⭐ Rating Bars</option>
                <option value="volume-bar">📊 Volume Bars</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {statistics && (
        <>
          <StatisticsCards statistics={statistics.statistics} period={statistics.period} />
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-header">
                <h2>Rating Distribution</h2>
                <div className="chart-type-indicator">
                  {chartSettings.distributionType === 'doughnut' ? '🍩' : '📊'} {chartSettings.distributionType}
                </div>
              </div>
              <RatingDistributionChart 
                distribution={statistics.statistics.ratingDistribution}
                totalRatings={statistics.statistics.totalRatings}
                chartType={chartSettings.distributionType}
              />
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <h2>📈 Daily Rating Trends</h2>
                <div className="chart-type-indicator">
                  {chartSettings.trendsType === 'line' ? '📈 Combined' : 
                   chartSettings.trendsType === 'rating-bar' ? '⭐ Ratings' : '📊 Volume'} 
                </div>
              </div>
              <DailyAnalyticsChart 
                dailyTrends={statistics.dailyTrends} 
                chartType={chartSettings.trendsType}
              />
            </div>

            <div className="analytics-card">
              <h2>Top Rated Dishes</h2>
              <TrendingDishes dishes={trendingDishes} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
