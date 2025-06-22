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
      credentials: 'include',
    };

    // Only set JSON content type if not sending FormData
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    } else {
      config.headers = {
        ...options.headers,
      };
    }

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
   * @param {object} filters - Opcjonalne filtry, np. { page: 1, limit: 10, category: 'zupa' }
   * @returns {Promise<Object>} Obiekt zawierający { dishes, currentPage, totalPages, totalDishes }.
   */
  getAll(filters = {}) {
    const defaultFilters = { };   
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
   * Tworzy nowe danie z plikiem obrazu.
   * @param {object} dishData - Dane nowego dania.
   * @param {File} imageFile - Plik obrazu (opcjonalny).
   * @returns {Promise<Object>} Utworzone danie.  
   */
  async createWithImage(dishData, imageFile = null) {
    // Usuwamy puste _id z formularza, jeśli istnieje
    const { _id, ...data } = dishData;
    
    if (imageFile) {
      // Upload image first
      const fileUploadService = (await import('./fileUploadService')).default;
      const uploadResult = await fileUploadService.uploadFile(imageFile, 'dish-image');
      data.imageUrl = uploadResult.file.url;
    }
    
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
   * Aktualizuje istniejące danie z możliwością dodania nowego obrazu.
   * @param {string} dishId - ID dania do aktualizacji.
   * @param {object} dishData - Nowe dane dla dania.
   * @param {File} imageFile - Nowy plik obrazu (opcjonalny).
   * @returns {Promise<Object>} Zaktualizowane danie.
   */
  async updateWithImage(dishId, dishData, imageFile = null) {
    const data = { ...dishData };
    
    if (imageFile) {
      // Upload new image first
      const fileUploadService = (await import('./fileUploadService')).default;
      
      // Delete old image if it exists
      if (data.imageUrl) {
        try {
          await fileUploadService.deleteFile(data.imageUrl);
        } catch (error) {
          console.warn('Could not delete old image:', error);
        }
      }
      
      // Upload new image
      const uploadResult = await fileUploadService.uploadFile(imageFile, 'dish-image');
      data.imageUrl = uploadResult.file.url;
    }
    
    return this._request(`/${dishId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Usuwa danie (soft delete).
   * @param {string} dishId - ID dania do dezaktywacji.
   * @returns {Promise<Object>} Obiekt z komunikatem od serwera.
   */
  remove(dishId) {
    return this._request(`/${dishId}`, { method: 'DELETE' });
  }
}

const dishApi = new DishApi();
export default dishApi;