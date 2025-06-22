// Adres bazowy naszego API. Jeśli aplikacja frontendowa jest serwowana z tego samego serwera co backend,
// wystarczy ścieżka. W przeciwnym razie podaj pełny adres, np. 'http://localhost:3001/api'.
const API_URL = '/api/menus';

// Funkcja pomocnicza do obsługi odpowiedzi z fetch
const handleResponse = async (response) => {
  if (!response.ok) {
    // Jeśli status odpowiedzi nie jest w zakresie 200-299, rzucamy błąd.
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('Błąd podczas komunikacji z API:', errorData);
    throw new Error(errorData.message || 'Wystąpił błąd serwera');
  }
  // Dla odpowiedzi 204 (No Content), np. po DELETE, nie ma treści do sparsowania
  if (response.status === 204) {
    return null;
  }
  return response.json();
};


/**
 * Pobiera menu dla konkretnej daty (YYYY-MM-DD).
 * GET /api/menus/date/{dateString}
 * @param {string} dateString - Data w formacie 'YYYY-MM-DD'
 * @returns {Promise<Object>} Obiekt menu
 */
export const getMenuByDate = (dateString) => {
  return fetch(`${API_URL}/date/${dateString}`).then(handleResponse);
};

export const getAllMenus = () => {
  return fetch(`${API_URL}/`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    });
};

/**
 * Pobiera menu w zadanym zakresie dat.
 * GET /api/menus?startDate=...&endDate=...
 * @param {string} startDate - Data początkowa w formacie 'YYYY-MM-DD'
 * @param {string} endDate - Data końcowa w formacie 'YYYY-MM-DD'
 * @returns {Promise<Array>} Tablica obiektów menu
 */
export const getMenusByDateRange = (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  return fetch(`${API_URL}?${params}`).then(handleResponse);
};

/**
 * Tworzy nowe menu.
 * POST /api/menus
 * @param {Object} menuData - Dane nowego menu, np. { date: 'YYYY-MM-DD', dishes: ['dishId1', 'dishId2'] }
 * @returns {Promise<Object>} Utworzony obiekt menu
 */
export const createMenu = (menuData) => {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuData),
  }).then(handleResponse);
};

/**
 * Aktualizuje istniejące menu.
 * PUT /api/menus/{menuId}
 * @param {string} menuId - ID menu do aktualizacji
 * @param {Object} menuData - Nowe dane menu
 * @returns {Promise<Object>} Zaktualizowany obiekt menu
 */
export const updateMenu = (menuId, menuData) => {
  return fetch(`${API_URL}/${menuId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(menuData),
  }).then(handleResponse);
};

/**
 * Usuwa menu.
 * DELETE /api/menus/{menuId}
 * @param {string} menuId - ID menu do usunięcia
 * @returns {Promise<null>}
 */
export const deleteMenu = (menuId) => {
  return fetch(`${API_URL}/${menuId}`, {
    method: 'DELETE',
  }).then(handleResponse);
};