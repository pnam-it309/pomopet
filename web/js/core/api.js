/* ==========================================================================
   POMOPET MOBILE - Centralized API Client with JWT Interceptor (OOP)
   ========================================================================== */

class ApiClient {
  constructor() {
    this.tokenKey = 'pomopet_auth_token';
    this.userKey = 'pomopet_auth_user';
    this.token = localStorage.getItem(this.tokenKey) || '';
  }

  setAuth(user, token) {
    this.token = token;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  logout() {
    this.token = '';
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUser() {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  isAuthenticated() {
    return Boolean(this.token);
  }

  async request(endpoint, options = {}) {
    const headers = options.headers || {};
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    options.headers = headers;

    const response = await fetch(endpoint, options);

    if (response.status === 401) {
      this.logout();
      if (window.app && window.app.onUnauthorized) {
        window.app.onUnauthorized();
      }
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && data.error) ? data.error : `HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

window.apiClient = new ApiClient();
