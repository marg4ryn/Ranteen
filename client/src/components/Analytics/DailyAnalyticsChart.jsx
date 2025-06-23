import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DailyAnalyticsChart = ({ dailyTrends, chartType = 'line' }) => {
  if (!dailyTrends || dailyTrends.length === 0) {
    return (
      <div className="daily-analytics-chart">
        <div className="no-data">
          <p>No daily trends data available</p>
        </div>
      </div>
    );
  }

  // Memoized calculations for better performance
  const chartData = useMemo(() => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    };

    const getRatingColor = (rating) => {
      if (rating >= 4.5) return '#00b894';
      if (rating >= 4.0) return '#6c5ce7';
      if (rating >= 3.5) return '#fdcb6e';
      if (rating >= 3.0) return '#ff7675';
      return '#ff4757';
    };

    const getRatingGradient = (rating) => {
      if (rating >= 4.5) return 'rgba(0, 184, 148, 0.2)';
      if (rating >= 4.0) return 'rgba(108, 92, 231, 0.2)';
      if (rating >= 3.5) return 'rgba(253, 203, 110, 0.2)';
      if (rating >= 3.0) return 'rgba(255, 118, 117, 0.2)';
      return 'rgba(255, 71, 87, 0.2)';
    };

    const labels = dailyTrends.map(day => formatDate(day.date || day._id));
    const ratings = dailyTrends.map(day => day.averageRating);
    const volumes = dailyTrends.map(day => day.totalRatings);

    return {
      labels,
      ratings,
      volumes,
      getRatingColor,
      getRatingGradient
    };
  }, [dailyTrends]);

  const trendAnalysis = useMemo(() => {
    const { ratings, volumes } = chartData;
    
    // Calculate trend direction
    const ratingTrend = ratings.length > 1 ? 
      (ratings[ratings.length - 1] - ratings[0]) / ratings.length : 0;
    
    const volumeTrend = volumes.length > 1 ? 
      (volumes[volumes.length - 1] - volumes[0]) / volumes.length : 0;

    // Calculate volatility (standard deviation)
    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const ratingVariance = ratings.reduce((sum, rating) => sum + Math.pow(rating - avgRating, 2), 0) / ratings.length;
    const ratingVolatility = Math.sqrt(ratingVariance);

    // Find best and worst streaks
    let bestStreak = 0, worstStreak = 0, currentBestStreak = 0, currentWorstStreak = 0;
    const threshold = avgRating;
    
    ratings.forEach(rating => {
      if (rating >= threshold) {
        currentBestStreak++;
        currentWorstStreak = 0;
        bestStreak = Math.max(bestStreak, currentBestStreak);
      } else {
        currentWorstStreak++;
        currentBestStreak = 0;
        worstStreak = Math.max(worstStreak, currentWorstStreak);
      }
    });

    return {
      ratingTrend,
      volumeTrend,
      ratingVolatility,
      bestStreak,
      worstStreak,
      avgRating,
      totalRatings: volumes.reduce((sum, volume) => sum + volume, 0),
      maxRating: Math.max(...ratings),
      minRating: Math.min(...ratings),
      maxVolume: Math.max(...volumes),
      trendDirection: ratingTrend > 0.05 ? 'improving' : ratingTrend < -0.05 ? 'declining' : 'stable'
    };
  }, [chartData]);
  // Enhanced chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#6c5ce7',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            if (context.datasetIndex === 0) {
              return `${label}: ${context.parsed.y.toFixed(2)} ⭐`;
            } else {
              return `${label}: ${context.parsed.y} ratings`;
            }
          },
          footer: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const rating = chartData.ratings[index];
            const trend = index > 0 ? 
              (rating - chartData.ratings[index - 1]).toFixed(2) : 0;
            return trend !== 0 ? `Trend: ${trend > 0 ? '+' : ''}${trend}` : '';
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Enhanced line chart configuration
  const lineOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Average Rating',
          font: {
            size: 12,
            weight: '600'
          }
        },
        min: Math.max(1, trendAnalysis.minRating - 0.2),
        max: Math.min(5, trendAnalysis.maxRating + 0.2),
        ticks: {
          stepSize: 0.1,
          callback: function(value) {
            return value.toFixed(1) + ' ⭐';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Ratings',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: trendAnalysis.maxVolume * 1.1
      },
    }
  };

  const lineData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Average Rating',
        data: chartData.ratings,
        borderColor: '#00b894',
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 184, 148, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 184, 148, 0.05)');
          return gradient;
        },
        yAxisID: 'y',
        tension: 0.4,
        pointBackgroundColor: chartData.ratings.map(rating => chartData.getRatingColor(rating)),
        pointBorderColor: chartData.ratings.map(rating => chartData.getRatingColor(rating)),
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        fill: true,
      },
      {
        label: 'Rating Volume',
        data: chartData.volumes,
        borderColor: '#e17055',
        backgroundColor: 'rgba(225, 112, 85, 0.1)',
        yAxisID: 'y1',
        type: 'line',
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#e17055',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Enhanced bar chart options
  const barOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        beginAtZero: chartType !== 'rating-bar',
        title: {
          display: true,
          text: chartType === 'rating-bar' ? 'Average Rating' : 'Number of Ratings',
          font: {
            size: 12,
            weight: '600'
          }
        },
        ...(chartType === 'rating-bar' && {
          min: Math.max(1, trendAnalysis.minRating - 0.2),
          max: Math.min(5, trendAnalysis.maxRating + 0.2),
          ticks: { 
            stepSize: 0.1,
            callback: function(value) {
              return value.toFixed(1) + ' ⭐';
            }
          }
        }),
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const barData = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartType === 'rating-bar' ? 'Average Rating' : 'Number of Ratings',
        data: chartType === 'rating-bar' ? chartData.ratings : chartData.volumes,
        backgroundColor: chartType === 'rating-bar' 
          ? chartData.ratings.map(rating => chartData.getRatingColor(rating) + '80')
          : chartData.volumes.map((_, index) => {
              const alpha = 0.6 + (index / chartData.volumes.length) * 0.4;
              return `rgba(225, 112, 85, ${alpha})`;
            }),
        borderColor: chartType === 'rating-bar'
          ? chartData.ratings.map(rating => chartData.getRatingColor(rating))
          : '#e17055',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  // Chart type selector
  const ChartComponent = chartType === 'line' ? Line : Bar;
  const finalChartData = chartType === 'line' ? lineData : barData;
  const finalChartOptions = chartType === 'line' ? lineOptions : barOptions;

  return (
    <div className="daily-analytics-chart-container">
      {/* Trend Indicator */}
      <div className="trend-indicator">
        <div className={`trend-badge ${trendAnalysis.trendDirection}`}>
          <span className="trend-icon">
            {trendAnalysis.trendDirection === 'improving' ? '📈' : 
             trendAnalysis.trendDirection === 'declining' ? '📉' : '➡️'}
          </span>
          <span className="trend-text">
            {trendAnalysis.trendDirection === 'improving' ? 'Improving Trend' : 
             trendAnalysis.trendDirection === 'declining' ? 'Declining Trend' : 'Stable Trend'}
          </span>
          <span className="trend-value">
            {trendAnalysis.ratingTrend > 0 ? '+' : ''}{trendAnalysis.ratingTrend.toFixed(3)} ⭐/day
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ChartComponent 
          options={finalChartOptions} 
          data={finalChartData}
          height={300}
        />
      </div>

      {/* Enhanced Summary Statistics */}
      <div className="chart-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Period:</span>
            <span className="stat-value">{dailyTrends.length} days</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Rating:</span>
            <span className="stat-value">{trendAnalysis.avgRating.toFixed(2)} ⭐</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Ratings:</span>
            <span className="stat-value">{trendAnalysis.totalRatings.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Best Day:</span>
            <span className="stat-value">{trendAnalysis.maxRating.toFixed(2)} ⭐</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lowest Day:</span>
            <span className="stat-value">{trendAnalysis.minRating.toFixed(2)} ⭐</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Volatility:</span>
            <span className="stat-value">{trendAnalysis.ratingVolatility.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Performance Insights */}
        <div className="performance-insights">
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Best Streak:</span>
              <span className="insight-value good">{trendAnalysis.bestStreak} days</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Challenging Period:</span>
              <span className="insight-value warning">{trendAnalysis.worstStreak} days</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Volume Trend:</span>
              <span className={`insight-value ${trendAnalysis.volumeTrend > 0 ? 'good' : trendAnalysis.volumeTrend < 0 ? 'warning' : 'neutral'}`}>
                {trendAnalysis.volumeTrend > 0 ? '+' : ''}{trendAnalysis.volumeTrend.toFixed(1)}/day
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Rating Range:</span>
              <span className="insight-value neutral">
                {(trendAnalysis.maxRating - trendAnalysis.minRating).toFixed(2)} ⭐
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAnalyticsChart;
