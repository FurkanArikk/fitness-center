import axios from "axios";

// Request and response tracking
const logRequestAndResponse = (config) => {
  console.log(
    `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${
      config.url
    }`
  );
  return config;
};

// Create axios instance
// We can leave baseURL empty since we're using Next.js rewrites
const apiClient = axios.create({
  baseURL: "", // Leave empty as we're using Next.js rewrites for routing
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to false to prevent CORS issues
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    logRequestAndResponse(config);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Retry interceptor for handling intermittent failures
const retryInterceptor = async (error) => {
  const { config } = error;

  // If config doesn't exist or we're already retrying too many times, reject
  if (!config || config._retryCount >= 2) {
    // Reduced retry count to 2
    return Promise.reject(error);
  }

  // Set the retry count
  config._retryCount = config._retryCount || 0;
  config._retryCount += 1;


  // Create a delay promise for exponential backoff
  const delay = new Promise((resolve) => {
    setTimeout(() => resolve(), Math.min(config._retryCount * 1000, 3000)); // Max 3s delay
  });

  // Retry the request after delay
  await delay;
  return await apiClient(config);
};

// Add response interceptor for error handling with retry
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with an error code (4xx, 5xx)
      console.error(
        `[API Error] ${error.response.status} ${error.config?.url}:`,
        error.response.data
      );

      // Only retry on 5xx errors (server errors) and network timeouts
      if (error.response.status >= 500 || error.code === "ECONNABORTED") {
        return retryInterceptor(error);
      }

      // For 4xx errors, don't retry but provide better error info
      if (error.response.status >= 400 && error.response.status < 500) {
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          "Client error";
        console.warn(
          `[API Client Error] ${error.response.status}: ${errorMessage}`
        );
      }
    } else if (error.request) {
      // Request was made but no response received - retry these
      console.error(
        `[API Connection Error] ${error.config?.url}:`,
        error.message
      );
      return retryInterceptor(error);
    } else {
      // Error creating request
      console.error("[API Configuration Error]:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
