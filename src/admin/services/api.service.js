const API_BASE_URL = 'http://srv1118630.hstgr.cloud:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
  }

  // Set authentication token
  setAuthToken(token) {
    this.authToken = token;
  }

  // Remove authentication token
  removeAuthToken() {
    this.authToken = null;
  }

  // Get headers
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      // Ensure headers are correctly merged and Authorization is included
      headers: this.getHeaders(options.headers)
    };

    // Remove Content-Type header if body is FormData (for upload)
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Token expired or invalid
        this.removeAuthToken();
        // Clear local storage (assuming these are the keys used by your app)
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        
        // Redirect to login page
        window.location.href = '/login';
        
        // Stop execution with an error
        throw new Error('Session expired. Please login again.');
      }

      // Handle 204 No Content for successful DELETE/PUT where no data is returned
      if (response.status === 204) {
          return { success: true, message: 'Operation successful (No Content)' };
      }

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the API response if available
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    // Use URLSearchParams directly in the request method for a cleaner structure
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Upload file (uses FormData, which requires omitting the 'Content-Type': 'application/json' header)
  async upload(endpoint, formData) {
    // Note: The Content-Type header is handled within the generic request method
    return this.request(endpoint, {
      method: 'POST',
      body: formData // Body is FormData, not stringified JSON
    });
  }
}


export const apiService = new ApiService();
export default apiService;