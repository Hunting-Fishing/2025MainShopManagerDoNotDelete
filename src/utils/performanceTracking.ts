
// Define thresholds for performance warnings
const PERFORMANCE_WARNING_THRESHOLD_MS = 500; // 500ms
const PERFORMANCE_CRITICAL_THRESHOLD_MS = 2000; // 2s

// Storage for tracking cumulative performance metrics
interface PerformanceMetric {
  operation: string;
  count: number;
  totalDuration: number;
  maxDuration: number;
  lastTimestamp: number;
}

const performanceMetrics: Record<string, PerformanceMetric> = {};

export const startPerformanceTimer = (operation: string): { end: () => void } => {
  const start = performance.now();
  console.log(`Starting performance measurement for: ${operation}`);
  
  return {
    end: () => {
      const end = performance.now();
      const duration = end - start;
      
      // Log with appropriate warning level
      if (duration > PERFORMANCE_CRITICAL_THRESHOLD_MS) {
        console.error(`Performance critical: ${operation} took ${duration.toFixed(2)}ms`);
      } else if (duration > PERFORMANCE_WARNING_THRESHOLD_MS) {
        console.warn(`Performance warning: ${operation} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      // Track metrics for this operation
      if (!performanceMetrics[operation]) {
        performanceMetrics[operation] = {
          operation,
          count: 0,
          totalDuration: 0,
          maxDuration: 0,
          lastTimestamp: Date.now()
        };
      }
      
      const metric = performanceMetrics[operation];
      metric.count++;
      metric.totalDuration += duration;
      metric.maxDuration = Math.max(metric.maxDuration, duration);
      metric.lastTimestamp = Date.now();
      
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

// Get performance metrics for reporting/debugging
export const getPerformanceMetrics = (): PerformanceMetric[] => {
  return Object.values(performanceMetrics).map(metric => ({
    ...metric,
    avgDuration: metric.count > 0 ? metric.totalDuration / metric.count : 0
  })) as PerformanceMetric[];
};

// Reset performance metrics (useful for testing)
export const resetPerformanceMetrics = (): void => {
  Object.keys(performanceMetrics).forEach(key => {
    delete performanceMetrics[key];
  });
};
