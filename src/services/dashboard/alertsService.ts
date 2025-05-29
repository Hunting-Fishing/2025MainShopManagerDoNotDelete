
import { supabase } from "@/lib/supabase";

export interface DashboardAlert {
  id: string;
  type: 'inventory' | 'follow_up' | 'maintenance';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export const getDashboardAlerts = async (): Promise<DashboardAlert[]> => {
  try {
    const alerts: DashboardAlert[] = [];

    // Get low stock inventory alerts
    const { data: inventorySettings } = await supabase
      .from('inventory_settings')
      .select('low_stock_threshold')
      .limit(1);

    const threshold = inventorySettings?.[0]?.low_stock_threshold || 10;

    const { data: lowStockItems } = await supabase
      .from('inventory_items')
      .select('id, name, quantity, reorder_point')
      .lt('quantity', threshold)
      .eq('status', 'active');

    if (lowStockItems && lowStockItems.length > 0) {
      lowStockItems.forEach(item => {
        alerts.push({
          id: `inventory-${item.id}`,
          type: 'inventory',
          title: 'Low Stock Alert',
          message: `${item.name} is low on stock (${item.quantity} remaining)`,
          priority: item.quantity === 0 ? 'high' : 'medium',
          created_at: new Date().toISOString()
        });
      });
    }

    // Get pending follow-ups
    const { data: followUps } = await supabase
      .from('follow_ups')
      .select(`
        id,
        type,
        due_date,
        notes,
        customers (
          first_name,
          last_name
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .limit(5);

    if (followUps && followUps.length > 0) {
      followUps.forEach(followUp => {
        const customer = followUp.customers as any;
        const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer';
        
        alerts.push({
          id: `followup-${followUp.id}`,
          type: 'follow_up',
          title: 'Follow-up Due',
          message: `Follow-up with ${customerName} is due today`,
          priority: 'medium',
          created_at: followUp.due_date
        });
      });
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  } catch (error) {
    console.error("Error fetching dashboard alerts:", error);
    return [];
  }
};
