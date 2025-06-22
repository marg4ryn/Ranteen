class AuthApi {
  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  loginWithGoogle() {
    window.location.href = `${this.baseUrl}/google`;
  }

  async logout() {
    await fetch(`${this.baseUrl}/logout`, { method: 'POST' });
  }

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
      console.error('AuthApi.loginAdmin error:', error);
      throw error;
    }
  }

  async getMe() {
    try {
      const response = await fetch(`${this.baseUrl}/me`);
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Błąd pobierania danych użytkownika.');
      }
      return response.json();
    } catch (error) {
      console.error('AuthApi.getMe error:', error);
      return null;
    }
  }

  async getPendingUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/pending-students`);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching pending users:', error);
      return [];
    }
  }

  async approveUser(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/students/${userId}/approve`, {
        method: 'PATCH',
      });
      return await response.json();
    } catch (error) {
      console.error(`Error approving user ${userId}:`, error);
      throw error;
    }
  }

  async rejectUser(userId, reason) {
    try {
      const response = await fetch(`${this.baseUrl}/admin/students/${userId}/reject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      return await response.json();
    } catch (error) {
      console.error(`Error rejecting user ${userId}:`, error);
      throw error;
    }
  }
}

const authApi = new AuthApi();
export default authApi;
