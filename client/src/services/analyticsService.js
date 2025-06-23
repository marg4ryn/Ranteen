/**
 * Service for managing analytics API calls
 */
class AnalyticsService {
  constructor(baseUrl = '/api/analytics') {
    this.baseUrl = baseUrl;
  }

  async _request(endpoint = '', options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const responseData = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.errors?.[0]?.msg || 'Server error occurred';
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error('Error in AnalyticsService:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific dish
   * @param {string} dishId - The ID of the dish
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string} params.groupBy - Group by 'day' or 'overall'
   * @returns {Promise<Object>} Dish analytics data
   */
  async getDishAnalytics(dishId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/dish/${dishId}${queryString ? `?${queryString}` : ''}`;
    
    return this._request(endpoint);
  }

  /**
   * Get analytics for a specific day
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by dish category
   * @returns {Promise<Object>} Daily analytics data
   */
  async getDailyAnalytics(date, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    const endpoint = `/daily/${date}${queryString ? `?${queryString}` : ''}`;
    
    return this._request(endpoint);
  }

  /**
   * Get trending dishes
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {number} params.limit - Number of dishes to return
   * @param {string} params.category - Filter by dish category
   * @returns {Promise<Object>} Trending dishes data
   */
  async getTrendingDishes(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);

    const queryString = queryParams.toString();
    const endpoint = `/trending${queryString ? `?${queryString}` : ''}`;
    
    return this._request(endpoint);
  }

  /**
   * Get overall rating statistics
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Rating statistics
   */
  async getRatingStatistics(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/statistics${queryString ? `?${queryString}` : ''}`;
    
    return this._request(endpoint);
  }

  /**
   * Get date range for available data
   * @returns {Promise<Object>} Date range information
   */
  async getDateRange() {
    return this.getRatingStatistics();
  }
}

// Export a singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
