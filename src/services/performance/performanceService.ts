import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: { time: string; value: number }[];
  metadata?: any;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
  uptime: number;
}

export async function getSystemMetrics(): Promise<PerformanceMetric[]> {
  const { data, error } = await supabase.rpc('get_latest_system_metrics');
  
  if (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }

  // Get historical data for each metric
  const metricsWithHistory = await Promise.all(
    data.map(async (metric: any) => {
      const { data: historyData, error: historyError } = await supabase
        .from('performance_logs')
        .select('metric_value, timestamp')
        .eq('metric_name', metric.metric_name)
        .order('timestamp', { ascending: false })
        .limit(24);

      if (historyError) {
        console.error('Error fetching metric history:', historyError);
      }

      const history = (historyData || []).map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString(),
        value: h.metric_value
      })).reverse();

      return {
        name: metric.metric_name,
        value: parseFloat(metric.metric_value),
        unit: metric.metric_unit,
        status: metric.status,
        trend: metric.trend,
        history,
        metadata: metric.metadata
      };
    })
  );

  return metricsWithHistory;
}

export async function getSystemHealth(): Promise<SystemHealth> {
  // For now, calculate from existing metrics
  // In a real system, this would come from system monitoring
  const metrics = await getSystemMetrics();
  
  const memoryMetric = metrics.find(m => m.name === 'Memory Usage');
  const dbMetric = metrics.find(m => m.name === 'Database Query Time');
  
  return {
    cpu: 45 + Math.random() * 20, // Simulated for now
    memory: memoryMetric?.value || 78,
    disk: 62 + Math.random() * 15, // Simulated for now
    network: 34 + Math.random() * 20, // Simulated for now
    database: dbMetric ? Math.min(100, (200 - dbMetric.value) / 2) : 56,
    uptime: 99.9
  };
}

export async function updateSystemMetric(
  metricName: string, 
  value: number, 
  status: 'good' | 'warning' | 'critical',
  trend: 'up' | 'down' | 'stable'
): Promise<void> {
  const { error } = await supabase
    .from('system_metrics')
    .upsert({
      metric_name: metricName,
      metric_value: value,
      metric_unit: getMetricUnit(metricName),
      status,
      trend
    });

  if (error) {
    console.error('Error updating system metric:', error);
    throw error;
  }

  // Also log to performance_logs
  await supabase
    .from('performance_logs')
    .insert({
      metric_name: metricName,
      metric_value: value
    });
}

function getMetricUnit(metricName: string): string {
  const units: Record<string, string> = {
    'Page Load Time': 's',
    'API Response Time': 'ms',
    'Database Query Time': 'ms',
    'Memory Usage': '%',
    'Error Rate': '%',
    'Active Users': 'users'
  };
  return units[metricName] || '';
}

export const optimizationSuggestions = [
  {
    type: 'critical',
    title: 'Database Query Optimization',
    description: 'Several slow queries detected. Consider adding indexes for customer lookup queries.',
    impact: 'High',
    effort: 'Medium'
  },
  {
    type: 'warning',
    title: 'Memory Usage Optimization',
    description: 'Memory usage is consistently above 75%. Consider implementing caching strategies.',
    impact: 'Medium',
    effort: 'Low'
  },
  {
    type: 'info',
    title: 'CDN Implementation',
    description: 'Static assets could benefit from CDN distribution to improve load times.',
    impact: 'Medium',
    effort: 'High'
  }
];