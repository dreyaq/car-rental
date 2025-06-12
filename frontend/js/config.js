const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:8080/api'
    },
    production: {
        API_BASE_URL: 'https://autorent-backend.onrender.com/api'
    }
};

const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' &&
                    !window.location.hostname.includes('192.168.') &&
                    !window.location.hostname.includes('file://');

const currentConfig = isProduction ? CONFIG.production : CONFIG.development;

window.APP_CONFIG = currentConfig;

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('API Base URL:', currentConfig.API_BASE_URL);
