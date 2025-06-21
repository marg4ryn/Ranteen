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