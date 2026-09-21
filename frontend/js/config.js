/**
 * Teryak Platform - Environment & API Configuration
 */
(function() {
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';
  
  // If served directly from Node server port 5000 or production Vercel domain, use relative /api
  const isDirectServer = window.location.port === '5000' || (!isLocal && window.location.protocol.startsWith('http'));

  window.CONFIG = {
    API_BASE_URL: isDirectServer ? '/api' : (isLocal ? 'http://localhost:5000/api' : '/api'),
    APP_NAME: 'منصة ترياق الطبية',
    VERSION: '1.0.0',
    CURRENCY: 'ج.م'
  };
})();
