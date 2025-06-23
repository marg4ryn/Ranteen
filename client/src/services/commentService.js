/**
 * Service for managing comments API calls
 */
class CommentService {
  constructor(baseUrl = '/api/comments') {
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
      console.error('Error in CommentService:', error);
      throw error;
    }
  }

  /**
   * Create a new comment
   * @param {string} dishId - Dish ID
   * @param {string} menuDate - Menu date (YYYY-MM-DD format)
   * @param {string} text - Comment text
   * @returns {Promise<Object>} Comment object
   */
  async createComment(dishId, menuDate, text) {
    return this._request('', {
      method: 'POST',
      body: JSON.stringify({
        dishId,
        menuDate,
        text,
      }),
    });
  }

  /**
   * Get my comments with pagination
   * @param {object} options - Query options (page, limit, dishId, status)
   * @returns {Promise<Object>} Comments data with pagination
   */
  async getMyComments(options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.dishId) params.append('dishId', options.dishId);
    if (options.status) params.append('status', options.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this._request(`/my-comments${queryString}`);
  }

  /**
   * Get approved comments for a dish
   * @param {string} dishId - Dish ID
   * @param {object} options - Query options (page, limit, menuDate)
   * @returns {Promise<Object>} Comments data with pagination
   */
  async getCommentsForDish(dishId, options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.menuDate) params.append('menuDate', options.menuDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this._request(`/dish/${dishId}/approved${queryString}`);
  }

  /**
   * Update my comment
   * @param {string} commentId - Comment ID
   * @param {string} text - New comment text
   * @returns {Promise<Object>} Updated comment object
   */
  async updateMyComment(commentId, text) {
    return this._request(`/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Delete my comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Success message
   */
  async deleteMyComment(commentId) {
    return this._request(`/${commentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all comments for moderation (Admin only)
   * @param {object} options - Query options (page, limit, status, dishId, studentId)
   * @returns {Promise<Object>} Comments data with pagination
   */
  async getAllCommentsForModeration(options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.status) params.append('status', options.status);
    if (options.dishId) params.append('dishId', options.dishId);
    if (options.studentId) params.append('studentId', options.studentId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this._request(`/admin/moderate${queryString}`);
  }

  /**
   * Moderate a comment (Admin only)
   * @param {string} commentId - Comment ID
   * @param {string} status - 'approved' or 'rejected'
   * @returns {Promise<Object>} Updated comment object
   */
  async moderateComment(commentId, status) {
    return this._request(`/admin/moderate/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

// Export singleton instance
const commentService = new CommentService();
export default commentService;