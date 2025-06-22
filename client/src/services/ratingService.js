/**
 * Service for managing ratings API calls
 */
class RatingService {
  constructor(baseUrl = '/api/ratings') {
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
      console.error('Error in RatingService:', error);
      throw error;
    }
  }

  /**
   * Create or update a rating for a dish
   * @param {string} dishId - Dish ID
   * @param {string} menuDate - Menu date (YYYY-MM-DD format)
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise<Object>} Rating object
   */
  async createOrUpdateRating(dishId, menuDate, rating) {
    return this._request('', {
      method: 'POST',
      body: JSON.stringify({
        dishId,
        menuDate,
        rating,
      }),
    });
  }

  /**
   * Get my rating for a specific dish on a menu date
   * @param {string} dishId - Dish ID
   * @param {string} menuDate - Menu date (YYYY-MM-DD format)
   * @returns {Promise<Object|null>} Rating object or null if no rating exists
   */
  async getMyRating(dishId, menuDate) {
    try {
      return await this._request(`/my-rating/dish/${dishId}/menu-date/${menuDate}`);
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete my rating
   * @param {string} ratingId - Rating ID
   * @returns {Promise<Object>} Success message
   */
  async deleteMyRating(ratingId) {
    return this._request(`/${ratingId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all ratings for a dish (Admin only)
   * @param {string} dishId - Dish ID
   * @param {object} options - Query options (page, limit, startDate, endDate)
   * @returns {Promise<Object>} Ratings data with pagination
   */
  async getRatingsForDish(dishId, options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this._request(`/dish/${dishId}${queryString}`);
  }
}

// Export singleton instance
export default new RatingService();
