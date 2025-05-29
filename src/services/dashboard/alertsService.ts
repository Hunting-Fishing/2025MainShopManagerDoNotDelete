
import { supabase } from "@/lib/supabase";
import { getAllReminders } from "@/services/reminderService";

export interface Alert {
  id: string;
  type: 'reminder' | 'inventory' | 'equipment' | 'payment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

// Add DashboardAlert type alias for compatibility
export interface DashboardAlert {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

export interface AlertSummary {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  unresolved: number;
}

// Get all active alerts
export const getActiveAlerts = async (): Promise<Alert[]> => {
  try {
    const alerts: Alert[] = [];
    
    // Get reminder-based alerts
    const reminderAlerts = await getReminderAlerts();
    alerts.push(...reminderAlerts);
    
    // Get inventory alerts (placeholder - would need inventory service)
    // const inventoryAlerts = await getInventoryAlerts();
    // alerts.push(...inventoryAlerts);
    
    // Get equipment alerts (placeholder - would need equipment service)
    // const equipmentAlerts = await getEquipmentAlerts();
    // alerts.push(...equipmentAlerts);
    
    // Sort by severity and timestamp
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    return [];
  }
};

// Export as getDashboardAlerts for compatibility
export const getDashboardAlerts = async (): Promise<DashboardAlert[]> => {
  const alerts = await getActiveAlerts();
  return alerts.map(alert => ({
    id: alert.id,
    type: alert.type,
    priority: alert.severity,
    title: alert.title,
    message: alert.message,
    timestamp: alert.timestamp,
    resolved: alert.resolved,
    link: alert.link,
    metadata: alert.metadata
  }));
};

// Get summary of alerts
export const getAlertSummary = async (): Promise<AlertSummary> => {
  try {
    const alerts = await getActiveAlerts();
    
    const summary: AlertSummary = {
      total: alerts.length,
      byType: {},
      bySeverity: {},
      unresolved: 0
    };
    
    alerts.forEach(alert => {
      // Count by type
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
      
      // Count by severity
      summary.bySeverity[alert.severity] = (summary.bySeverity[alert.severity] || 0) + 1;
      
      // Count unresolved
      if (!alert.resolved) {
        summary.unresolved++;
      }
    });
    
    return summary;
  } catch (error) {
    console.error("Error getting alert summary:", error);
    return {
      total: 0,
      byType: {},
      bySeverity: {},
      unresolved: 0
    };
  }
};

// Get reminder-based alerts
const getReminderAlerts = async (): Promise<Alert[]> => {
  try {
    const alerts: Alert[] = [];
    
    // Get overdue reminders
    const overdueReminders = await getAllReminders({
      status: 'pending',
      dateRange: {
        to: new Date() // Past due date
      }
    });
    
    overdueReminders.forEach(reminder => {
      alerts.push({
        id: `reminder-overdue-${reminder.id}`,
        type: 'reminder',
        severity: 'high',
        title: 'Overdue Reminder',
        message: `Reminder "${reminder.title}" is overdue (due ${reminder.dueDate})`,
        timestamp: reminder.dueDate,
        resolved: false,
        link: `/reminders/${reminder.id}`,
        metadata: { reminderId: reminder.id, customerId: reminder.customerId }
      });
    });
    
    // Get reminders due soon (next 3 days)
    const upcomingSoon = new Date();
    upcomingSoon.setDate(upcomingSoon.getDate() + 3);
    
    const upcomingReminders = await getAllReminders({
      status: 'pending',
      dateRange: {
        from: new Date(),
        to: upcomingSoon
      }
    });
    
    upcomingReminders.forEach(reminder => {
      alerts.push({
        id: `reminder-upcoming-${reminder.id}`,
        type: 'reminder',
        severity: 'medium',
        title: 'Upcoming Reminder',
        message: `Reminder "${reminder.title}" is due ${reminder.dueDate}`,
        timestamp: reminder.dueDate,
        resolved: false,
        link: `/reminders/${reminder.id}`,
        metadata: { reminderId: reminder.id, customerId: reminder.customerId }
      });
    });
    
    return alerts;
  } catch (error) {
    console.error("Error getting reminder alerts:", error);
    return [];
  }
};

// Mark alert as resolved
export const resolveAlert = async (alertId: string): Promise<void> => {
  try {
    // For now, we'll handle this in memory/localStorage
    // In a real app, you'd save alert states to the database
    const resolvedAlerts = JSON.parse(localStorage.getItem('resolvedAlerts') || '[]');
    if (!resolvedAlerts.includes(alertId)) {
      resolvedAlerts.push(alertId);
      localStorage.setItem('resolvedAlerts', JSON.stringify(resolvedAlerts));
    }
  } catch (error) {
    console.error("Error resolving alert:", error);
  }
};

// Check if alert is resolved
export const isAlertResolved = (alertId: string): boolean => {
  try {
    const resolvedAlerts = JSON.parse(localStorage.getItem('resolvedAlerts') || '[]');
    return resolvedAlerts.includes(alertId);
  } catch (error) {
    console.error("Error checking alert resolution:", error);
    return false;
  }
};
