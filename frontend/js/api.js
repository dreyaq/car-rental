// Debug: API.js loaded
console.log('api.js файл загружен');

class Api {
    constructor() {
        this.baseUrl = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : '/api';
        this.token = localStorage.getItem('token');
        console.log('API Base URL:', this.baseUrl);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    isAuthenticated() {
        return !!this.token;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders(),
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type');
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                result = { error: text };
            }

            if (!response.ok) {
                const status = response.status;
                const statusText = response.statusText;
                let errorMessage = 'Error occurred during the request';
                if (result.error) {
                    errorMessage = result.error;
                } else if (result.message) {
                    errorMessage = result.message;
                } else if (status === 400) {
                    errorMessage = 'Bad request: Please check the data you submitted';
                } else if (status === 500) {
                    errorMessage = 'Server error: Please try again later';
                }
                const error = new Error(errorMessage);
                error.status = status;
                error.result = result;
                throw error;
            }

            return result;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Please check your connection or the server may be down');
            }
            throw error;
        }
    }

    async register(userData) {
        return this.request('/register', 'POST', userData);
    }

    async login(credentials) {
        const response = await this.request('/login', 'POST', credentials);
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async getProfile() {
        const result = await this.request('/profile');
        return result.user || result;
    }

    async updateProfile(profileData) {
        return this.request('/profile', 'PUT', profileData);
    }

    async changePassword(passwordData) {
        return this.request('/profile/password', 'PUT', passwordData);
    }

    async getCars(filters = {}) {
        const queryParams = Object.keys(filters)
            .filter(key => filters[key] !== null && filters[key] !== undefined && filters[key] !== '')
            .map(key => `${key}=${encodeURIComponent(filters[key])}`)
            .join('&');
        const endpoint = queryParams ? `/cars?${queryParams}` : '/cars';
        return this.request(endpoint);
    }

    async getCarById(id) {
        return this.request(`/cars/${id}`);
    }

    async getOwnerCarById(id) {
        return this.request(`/owner/cars/${id}`);
    }

    async getOwnerCars() {
        return this.request('/owner/cars');
    }

    async getCarFeatures() {
        return this.request('/features');
    }

    async getFeatureIdsByNames(featureNames) {
        try {
            const response = await this.getCarFeatures();
            const allFeatures = response.features || [];
            const featureMap = {};
            if (allFeatures && Array.isArray(allFeatures)) {
                allFeatures.forEach(feature => {
                    featureMap[feature.name.toLowerCase()] = feature.id;
                });
            }
            const matchedIds = featureNames
                .map(name => {
                    const id = featureMap[name.toLowerCase()];
                    return id;
                })
                .filter(id => id);
            return matchedIds;
        } catch (error) {
            return [];
        }
    }

    async createCar(carData) {
        try {
            const response = await this.request('/owner/cars', 'POST', carData);
            return response;
        } catch (error) {
            throw new Error(error.message || "Failed to create car. Please check all required fields.");
        }
    }

    async updateCar(id, carData) {
        return this.request(`/owner/cars/${id}`, 'PUT', carData);
    }

    async deleteCar(id) {
        return this.request(`/owner/cars/${id}`, 'DELETE');
    }

    async getRentals() {
        return this.request('/rentals');
    }

    async getRentalById(id) {
        return this.request(`/rentals/${id}`);
    }

    async createRental(rentalData) {
        return this.request('/rentals', 'POST', rentalData);
    }    async updateRentalStatus(id, status) {
        return this.request(`/rentals/${id}/status`, 'PATCH', { status });
    }    // Owner rental methods
    async getOwnerRentals() {
        return this.request('/rentals');
    }async approveRental(id) {
        return this.request(`/rentals/${id}/status`, 'PATCH', { status: 'confirmed' });
    }

    async rejectRental(id, reason = '') {
        return this.request(`/rentals/${id}/status`, 'PATCH', { status: 'cancelled' });
    }

    async getNotifications() {
        return this.request('/notifications');
    }    async markNotificationAsRead(id) {
        return this.request(`/notifications/${id}/read`, 'PATCH');
    }
}

// API будет инициализирован в app.js
