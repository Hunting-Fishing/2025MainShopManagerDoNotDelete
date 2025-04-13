
export const startPerformanceTimer = (operation: string): { end: () => void } => {
  const start = performance.now();
  console.log(`Starting performance measurement for: ${operation}`);
  
  return {
    end: () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
      
      // Could send this to an analytics service
      try {
        // Example placeholder for future analytics integration
        // analyticsService.trackPerformance(operation, duration);
      } catch (error) {
        console.error("Error tracking performance:", error);
      }
    }
  };
};
