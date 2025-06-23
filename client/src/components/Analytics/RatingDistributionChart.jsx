import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RatingDistributionChart = ({ distribution, totalRatings, chartType = 'bar' }) => {
  const ratings = [1, 2, 3, 4, 5];

  const getPercentage = (count) => {
    if (totalRatings === 0) return 0;
    return ((count / totalRatings) * 100).toFixed(1);
  };

  const getStarColor = (rating) => {
    const colors = {
      1: '#ff4757', // Red
      2: '#ff7675', // Light red
      3: '#fdcb6e', // Yellow
      4: '#6c5ce7', // Purple
      5: '#00b894'  // Green
    };
    return colors[rating] || '#ddd';
  };

  if (totalRatings === 0) {
    return (
      <div className="rating-distribution-chart">
        <div className="no-data">
          <p>No ratings data available</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const labels = ratings.map(rating => `${rating} Star${rating !== 1 ? 's' : ''}`);
  const data = ratings.map(rating => distribution[rating] || 0);
  const colors = ratings.map(rating => getStarColor(rating));

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const count = context.parsed.y;
            const percentage = getPercentage(count);
            return `${context.label}: ${count} ratings (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Rating'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Ratings'
        },
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const barData = {
    labels,
    datasets: [
      {
        label: 'Ratings',
        data,
        backgroundColor: colors.map(color => color + '80'),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: function(chart) {
            const data = chart.data;
            return data.labels.map((label, index) => {
              const count = data.datasets[0].data[index];
              const percentage = getPercentage(count);
              return {
                text: `${label}: ${count} (${percentage}%)`,
                fillStyle: colors[index],
                strokeStyle: colors[index],
                lineWidth: 2,
                index: index
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const count = context.parsed;
            const percentage = getPercentage(count);
            return `${context.label}: ${count} ratings (${percentage}%)`;
          }
        }
      },
    },
  };

  const doughnutData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.map(color => color + '80'),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  // Chart type selector
  const ChartComponent = chartType === 'doughnut' ? Doughnut : Bar;
  const chartData = chartType === 'doughnut' ? doughnutData : barData;
  const chartOptions = chartType === 'doughnut' ? doughnutOptions : barOptions;

  // Calculate statistics
  const averageRating = ratings.reduce((sum, rating) => {
    return sum + (rating * (distribution[rating] || 0));
  }, 0) / totalRatings;

  const mostCommonRating = ratings.reduce((max, rating) => {
    return (distribution[rating] || 0) > (distribution[max] || 0) ? rating : max;
  }, 1);

  return (
    <div className="rating-distribution-chart-container">
      <div className="chart-wrapper">
        <ChartComponent 
          options={chartOptions} 
          data={chartData}
          height={chartType === 'doughnut' ? 300 : 250}
        />
      </div>

      <div className="distribution-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Ratings:</span>
            <span className="stat-value">{totalRatings}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average:</span>
            <span className="stat-value">{averageRating.toFixed(2)} ⭐</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Most Common:</span>
            <span className="stat-value">{mostCommonRating} ⭐ ({getPercentage(distribution[mostCommonRating] || 0)}%)</span>
          </div>
        </div>

        {/* Detailed breakdown table */}
        <div className="rating-breakdown-table">
          <table>
            <thead>
              <tr>
                <th>Rating</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Bar</th>
              </tr>
            </thead>
            <tbody>
              {ratings.reverse().map(rating => {
                const count = distribution[rating] || 0;
                const percentage = getPercentage(count);
                const maxCount = Math.max(...ratings.map(r => distribution[r] || 0));
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <tr key={rating}>
                    <td>
                      <span className="stars">
                        {'★'.repeat(rating)}
                      </span>
                    </td>
                    <td className="count">{count}</td>
                    <td className="percentage">{percentage}%</td>
                    <td className="bar-cell">
                      <div className="mini-bar-container">
                        <div 
                          className="mini-bar"
                          style={{ 
                            width: `${barWidth}%`,
                            backgroundColor: getStarColor(rating)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionChart;
