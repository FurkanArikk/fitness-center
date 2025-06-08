import { SERVICE_PORTS, HEALTH_CHECK_BASE_URL } from "./endpoints";

const healthService = {
  // Health check methods for each service
  checkServiceHealth: async (service) => {
    try {
      // Use fetch with a timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `${HEALTH_CHECK_BASE_URL}:${SERVICE_PORTS[service]}/health`,
        {
          method: "GET",
          signal: controller.signal,
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Handle different types of errors gracefully
      if (error.name === "AbortError") {
        console.warn(`Health check timeout for ${service}`);
      } else if (error.message.includes("Failed to fetch")) {
        console.warn(
          `Service ${service} is not accessible (CORS or network issue)`
        );
      } else {
        console.warn(`Health check failed for ${service}:`, error.message);
      }
      return false;
    }
  },

  // Check all services health status
  checkAllServicesHealth: async () => {
    const services = Object.keys(SERVICE_PORTS);
    const healthChecks = services.map(async (service) => {
      const isHealthy = await healthService.checkServiceHealth(service);
      return { service, isHealthy };
    });

    try {
      const results = await Promise.allSettled(healthChecks);
      return results.reduce((acc, result, index) => {
        const service = services[index];
        if (result.status === "fulfilled") {
          acc[service] = result.value.isHealthy;
        } else {
          acc[service] = false;
        }
        return acc;
      }, {});
    } catch (error) {
      console.warn("Failed to check all services health:", error);
      // Return all services as offline if there's an error
      return services.reduce((acc, service) => {
        acc[service] = false;
        return acc;
      }, {});
    }
  },

  // Mock health data for development when services are not available
  getMockHealthData: () => {
    return Object.keys(SERVICE_PORTS).reduce((acc, service) => {
      // Make all core services online for better demo experience
      // You can customize which services should be online/offline here
      if (service === "payment-service") {
        acc[service] = true; // Always show payment service as online
      } else if (service === "member-service") {
        acc[service] = true; // Always show member service as online
      } else if (service === "staff-service") {
        acc[service] = true; // Always show staff service as online
      } else if (service === "class-service") {
        acc[service] = true; // Always show class service as online
      } else if (service === "facility-service") {
        acc[service] = Math.random() > 0.2; // 80% chance for facility service
      } else {
        acc[service] = Math.random() > 0.4; // 60% chance for other services
      }
      return acc;
    }, {});
  },
};

export default healthService;
