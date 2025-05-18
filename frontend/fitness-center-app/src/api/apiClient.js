import axios from 'axios';

// İstek ve yanıtları izleme
const logRequestAndResponse = (config) => {
  console.log(`[API İsteği] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
};

// Create axios instance
// Next.js rewrites kullandığımız için baseURL'yi boş bırakabiliriz
const apiClient = axios.create({
  baseURL: '', // Next.js rewrites ile yönlendirme yapılacağı için boş bırakıyoruz
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // CORS sorunlarını önlemek için false yapıyoruz
});

// İstek interceptor'u ekle
apiClient.interceptors.request.use(logRequestAndResponse, error => {
  console.error('API İstek Hatası:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    console.log(`[API Yanıtı] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    if (error.response) {
      // Sunucu yanıtı var ama hata kodu (4xx, 5xx)
      console.error(`[API Hata] ${error.response.status} ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error(`[API Bağlantı Hatası] ${error.config?.url}:`, error.request);
    } else {
      // İstek oluşturma hatası
      console.error('[API Konfigürasyon Hatası]:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
