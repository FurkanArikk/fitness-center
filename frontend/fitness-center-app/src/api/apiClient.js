import axios from 'axios';

// Request and response tracking
const logRequestAndResponse = (config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
};

// Create axios instance
// We can leave baseURL empty since we're using Next.js rewrites
const apiClient = axios.create({
  baseURL: '', // Leave empty as we're using Next.js rewrites for routing
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Set to false to prevent CORS issues
});

// Add request interceptor
apiClient.interceptors.request.use(logRequestAndResponse, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    if (error.response) {
      // Server responded with an error code (4xx, 5xx)
      console.error(`[API Error] ${error.response.status} ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error(`[API Connection Error] ${error.config?.url}:`, error.request);
    } else {
      // Error creating request
      console.error('[API Configuration Error]:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
