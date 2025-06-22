/**
 * Klasa do zarządzania komunikacją z API dla autentykacji.
 */
class AuthApi {
  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  /**
   * Inicjuje proces logowania przez Google.
   * Ta metoda nie używa fetch, ponieważ jej zadaniem jest przekierowanie przeglądarki.
   */
  loginWithGoogle() {
    window.location.href = `${this.baseUrl}/google`;
  }

  /**
   * Wylogowuje użytkownika poprzez wysłanie zapytania do serwera.
   * @returns {Promise<Object>} Odpowiedź z serwera, np. { message: 'Logged out' }.
   */
  async logout() {
    await fetch(`${this.baseUrl}/logout`, { method: 'POST' });
    // Po wylogowaniu sesja (cookie) jest usuwana po stronie serwera.
    // Frontend musi zaktualizować swój stan.
  }

  /**
   * Loguje administratora przy użyciu adresu e-mail i hasła.
   * @param {string} email - Email administratora.
   * @param {string} password - Hasło administratora.
   * @returns {Promise<Object>} Dane użytkownika lub błąd.
   */
  async loginAdmin(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Nieprawidłowy email lub hasło');
        }
        throw new Error('Błąd serwera podczas logowania');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("AuthApi.loginAdmin error:", error);
      throw error;
    }
  }

  /**
   * Pobiera dane aktualnie zalogowanego użytkownika na podstawie sesji (cookie).
   * @returns {Promise<Object>} Dane użytkownika.
   */
  async getMe() {
    try {
      const response = await fetch(`${this.baseUrl}/me`);
      if (!response.ok) {
        // Status 401 (Unauthorized) jest oczekiwany, gdy użytkownik nie jest zalogowany.
        // Nie traktujemy tego jako błędu aplikacji, po prostu nie ma sesji.
        if (response.status === 401) {
          return null;
        }
        throw new Error('Błąd pobierania danych użytkownika.');
      }
      return response.json();
    } catch (error) {
      console.error("AuthApi.getMe error:", error);
      return null; // Zwróć null w przypadku błędu sieciowego itp.
    }
  }
}

const authApi = new AuthApi();
export default authApi;