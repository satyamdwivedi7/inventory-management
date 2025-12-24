const API_BASE_URL = 'https://inventory-management-backend-six-iota.vercel.app/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: { email, password },
    });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.request('/users/register', {
      method: 'POST',
      body: userData,
    });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: data,
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async updateUserRole(userId, data) {
    return this.request(`/users/${userId}/role`, {
      method: 'PUT',
      body: data,
    });
  }

  // Warehouse endpoints
  async getWarehouses() {
    return this.request('/warehouses');
  }

  async getWarehouse(id) {
    return this.request(`/warehouses/${id}`);
  }

  async createWarehouse(data) {
    return this.request('/warehouses', {
      method: 'POST',
      body: data,
    });
  }

  async updateWarehouse(id, data) {
    return this.request(`/warehouses/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteWarehouse(id) {
    return this.request(`/warehouses/${id}`, {
      method: 'DELETE',
    });
  }

  // SKU endpoints
  async getSKUs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sku${queryString ? `?${queryString}` : ''}`);
  }

  async getSKU(id) {
    return this.request(`/sku/${id}`);
  }

  async createSKU(data) {
    return this.request('/sku', {
      method: 'POST',
      body: data,
    });
  }

  async updateSKU(id, data) {
    return this.request(`/sku/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteSKU(id) {
    return this.request(`/sku/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory endpoints
  async getInventory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inventory${queryString ? `?${queryString}` : ''}`);
  }

  async getInventorySummary() {
    return this.request('/inventory/summary');
  }

  async getInventoryBySKU(skuId) {
    return this.request(`/inventory/sku/${skuId}`);
  }

  async updateStock(data) {
    return this.request('/inventory/update', {
      method: 'POST',
      body: data,
    });
  }

  async setInventory(data) {
    return this.request('/inventory/set', {
      method: 'POST',
      body: data,
    });
  }

  // Transaction endpoints
  async getTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransactionsBySKU(skuId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/transactions/sku/${skuId}${queryString ? `?${queryString}` : ''}`);
  }

  // Alert endpoints
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/alerts${queryString ? `?${queryString}` : ''}`);
  }

  async getLowStockAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/alerts/low-stock${queryString ? `?${queryString}` : ''}`);
  }

  async getDeadStockAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/alerts/dead-stock${queryString ? `?${queryString}` : ''}`);
  }

  // Analytics endpoints
  async getDashboard() {
    return this.request('/analytics/dashboard');
  }

  async getSKUPerformance(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/sku-performance${queryString ? `?${queryString}` : ''}`);
  }

  async getInventoryValue(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/inventory-value${queryString ? `?${queryString}` : ''}`);
  }

  async getStockAging(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/stock-aging${queryString ? `?${queryString}` : ''}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  logout() {
    this.removeToken();
  }
}

export const api = new ApiClient();
export default api;
