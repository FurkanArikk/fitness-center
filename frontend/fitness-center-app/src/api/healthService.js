import { SERVICE_PORTS } from './endpoints';

const healthService = {
  // Health check methods for each service
  checkServiceHealth: async (service) => {
    try {
      const response = await fetch(`http://localhost:${SERVICE_PORTS[service]}/health`);
      return response.ok;
    } catch (error) {
      console.error(`Health check failed for ${service}:`, error);
      return false;
    }
  },
};

export default healthService;
