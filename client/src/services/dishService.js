/**
 * Klasa do zarządzania komunikacją z API dla zasobu 'dishes'.
 * Dostosowana do kontrolera z paginacją, filtrowaniem i soft-delete.
 */
class DishApi {
  constructor(baseUrl = '/api/dishes') {
    this.baseUrl = baseUrl;
  }

  async _request(endpoint = '', options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const responseData = response.status === 204 ? null : await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.errors?.[0]?.msg || 'Wystąpił błąd serwera';
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error('Błąd w DishApi:', error);
      throw error;
    }
  }

  /**
   * Pobiera listę dań z paginacją i filtrowaniem.
   * Domyślnie pobiera tylko aktywne dania.
   * @param {object} filters - Opcjonalne filtry, np. { page: 1, limit: 10, category: 'zupa', isActive: true }
   * @returns {Promise<Object>} Obiekt zawierający { dishes, currentPage, totalPages, totalDishes }.
   */
  getAll(filters = {}) {
    // Domyślnie filtrujemy, aby pokazywać tylko aktywne dania, zgodnie z logiką kontrolera
    const defaultFilters = { isActive: false };
    const allFilters = { ...defaultFilters, ...filters };

    const params = new URLSearchParams(allFilters);
    const queryString = `?${params.toString()}`;
    return this._request(queryString);
  }

  /**
   * Pobiera pojedyncze danie po ID.
   * @param {string} dishId - ID dania.
   * @returns {Promise<Object>} Obiekt dania.
   */
  getById(dishId) {
    return this._request(`/${dishId}`);
  }

  /**
   * Tworzy nowe danie.
   * @param {object} dishData - Dane nowego dania.
   * @returns {Promise<Object>} Utworzone danie.
   */
  create(dishData) {
    // Usuwamy puste _id z formularza, jeśli istnieje
    const { _id, ...data } = dishData;
    return this._request('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Aktualizuje istniejące danie.
   * @param {string} dishId - ID dania do aktualizacji.
   * @param {object} dishData - Nowe dane dla dania.
   * @returns {Promise<Object>} Zaktualizowane danie.
   */
  update(dishId, dishData) {
    return this._request(`/${dishId}`, {
      method: 'PUT',
      body: JSON.stringify(dishData),
    });
  }

  /**
   * Usuwa danie (soft delete - ustawia isActive: false).
   * @param {string} dishId - ID dania do dezaktywacji.
   * @returns {Promise<Object>} Obiekt z komunikatem od serwera.
   */
  remove(dishId) {
    return this._request(`/${dishId}`, { method: 'DELETE' });
  }
}

const dishApi = new DishApi();
export default dishApi;