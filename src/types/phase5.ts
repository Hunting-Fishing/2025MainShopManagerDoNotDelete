export interface AIAnalytics {
  id: string;
  type: 'demand_forecast' | 'behavior_analysis' | 'price_optimization' | 'maintenance_prediction';
  data: any;
  confidence: number;
  generated_at: string;
  valid_until: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface AIRecommendation {
  id: string;
  type: 'product' | 'service' | 'cross_sell' | 'upsell';
  target_id: string;
  recommended_items: any[];
  confidence: number;
  reason: string;
  created_at: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'info' | 'warning' | 'error' | 'success';
  user_id: string;
  created_at: string;
  read: boolean;
  ai_generated: boolean;
  metadata?: any;
}

export interface AISearchResult {
  id: string;
  type: 'customer' | 'product' | 'order' | 'service' | 'document';
  title: string;
  description: string;
  relevance_score: number;
  metadata: any;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  conditions: any[];
  actions: any[];
  is_active: boolean;
  created_at: string;
  last_run: string | null;
  run_count: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  confidence: number;
  impact_level: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  created_at: string;
}