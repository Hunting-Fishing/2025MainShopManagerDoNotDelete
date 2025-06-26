
import { WorkOrder } from '@/types/workOrder';
import { supabase } from '@/lib/supabase';

export interface CacheStatus {
  size: number;
  lastUpdated: Date | null;
  lastFetch: Date | null;
  cacheAge: number;
}

export class HardcodedWorkOrderService {
  private cache: WorkOrder[] = [];
  private lastFetch: Date | null = null;
  private isLoading = false;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    // Check if we have fresh cached data
    if (this.cache.length > 0 && this.isCacheFresh()) {
      console.log('HardcodedWorkOrderService: Returning cached data');
      return this.cache;
    }

    // If already loading, wait for the current request
    if (this.isLoading) {
      console.log('HardcodedWorkOrderService: Request in progress, waiting...');
      return this.waitForCurrentRequest();
    }

    try {
      this.isLoading = true;
      console.log('HardcodedWorkOrderService: Fetching fresh data...');
      
      const workOrders = await this.fetchWorkOrdersWithFallback();
      
      this.cache = workOrders;
      this.lastFetch = new Date();
      
      console.log('HardcodedWorkOrderService: Successfully fetched', workOrders.length, 'work orders');
      return workOrders;
      
    } catch (error) {
      console.error('HardcodedWorkOrderService: Error fetching work orders:', error);
      
      // Return cached data if available, even if stale
      if (this.cache.length > 0) {
        console.log('HardcodedWorkOrderService: Returning stale cached data due to error');
        return this.cache;
      }
      
      // Last resort: return hardcoded sample data
      return this.getHardcodedSampleData();
      
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchWorkOrdersWithFallback(): Promise<WorkOrder[]> {
    const strategies = [
      () => this.fetchWithJoins(),
      () => this.fetchBasicWorkOrders(),
      () => this.fetchRawWorkOrders(),
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy();
        if (result && result.length >= 0) {
          return result;
        }
      } catch (error) {
        console.warn('HardcodedWorkOrderService: Strategy failed:', error);
        continue;
      }
    }

    throw new Error('All fetch strategies failed');
  }

  private async fetchWithJoins(): Promise<WorkOrder[]> {
    console.log('HardcodedWorkOrderService: Trying enhanced query with joins...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!inner (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin,
          odometer
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(this.normalizeWorkOrder);
  }

  private async fetchBasicWorkOrders(): Promise<WorkOrder[]> {
    console.log('HardcodedWorkOrderService: Trying basic query...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(this.normalizeWorkOrder);
  }

  private async fetchRawWorkOrders(): Promise<WorkOrder[]> {
    console.log('HardcodedWorkOrderService: Trying raw SQL query...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .limit(100);

    if (error) throw error;
    
    return (data || []).map(this.normalizeWorkOrder);
  }

  private normalizeWorkOrder(raw: any): WorkOrder {
    const workOrder: WorkOrder = {
      id: raw.id,
      status: raw.status || 'pending',
      description: raw.description || '',
      shop_id: raw.shop_id,
      customer_id: raw.customer_id,
      vehicle_id: raw.vehicle_id,
      advisor_id: raw.advisor_id,
      technician_id: raw.technician_id,
      estimated_hours: raw.estimated_hours,
      total_cost: raw.total_cost,
      created_by: raw.created_by,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      start_time: raw.start_time,
      end_time: raw.end_time,
      service_category_id: raw.service_category_id,
      invoiced_at: raw.invoiced_at,
      service_type: raw.service_type,
      invoice_id: raw.invoice_id,
      work_order_number: raw.work_order_number,
      
      // Customer fields
      customer_name: raw.customers?.first_name && raw.customers?.last_name 
        ? `${raw.customers.first_name} ${raw.customers.last_name}`
        : raw.customer_name,
      customer_first_name: raw.customers?.first_name || raw.customer_first_name,
      customer_last_name: raw.customers?.last_name || raw.customer_last_name,
      customer_email: raw.customers?.email || raw.customer_email,
      customer_phone: raw.customers?.phone || raw.customer_phone,
      customer_address: raw.customers?.address || raw.customer_address,
      customer_city: raw.customers?.city || raw.customer_city,
      customer_state: raw.customers?.state || raw.customer_state,
      customer_postal_code: raw.customers?.postal_code || raw.customer_postal_code,
      
      // Vehicle fields
      vehicle_make: raw.vehicles?.make || raw.vehicle_make,
      vehicle_model: raw.vehicles?.model || raw.vehicle_model,
      vehicle_year: raw.vehicles?.year?.toString() || raw.vehicle_year?.toString(),
      vehicle_license_plate: raw.vehicles?.license_plate || raw.vehicle_license_plate,
      vehicle_vin: raw.vehicles?.vin || raw.vehicle_vin,
      vehicle_odometer: raw.vehicles?.odometer?.toString() || raw.vehicle_odometer?.toString(),
      
      // Legacy fields for backward compatibility
      customer: raw.customers?.first_name && raw.customers?.last_name 
        ? `${raw.customers.first_name} ${raw.customers.last_name}`
        : raw.customer_name || 'Unknown Customer',
      technician: raw.technician || 'Unassigned',
      date: raw.created_at,
      dueDate: raw.due_date,
      due_date: raw.due_date,
      priority: raw.priority || 'medium',
      location: raw.location || 'Shop',
      notes: raw.notes || '',
      
      // Time tracking
      total_billable_time: raw.total_billable_time || 0,
      timeEntries: raw.time_entries || [],
      
      // Inventory
      inventoryItems: raw.inventory_items || [],
      inventory_items: raw.inventory_items || [],
    };

    return workOrder;
  }

  private getHardcodedSampleData(): WorkOrder[] {
    console.log('HardcodedWorkOrderService: Returning hardcoded sample data');
    
    return [
      {
        id: 'sample-wo-1',
        status: 'in_progress',
        description: 'Oil change and tire rotation',
        customer_name: 'John Doe',
        customer: 'John Doe',
        technician: 'Mike Johnson',
        date: new Date().toISOString(),
        priority: 'medium',
        location: 'Bay 1',
        notes: 'Customer requested synthetic oil',
        vehicle_make: 'Toyota',
        vehicle_model: 'Camry',
        vehicle_year: '2020',
        created_at: new Date().toISOString(),
        total_cost: 89.99,
        estimated_hours: 1.5,
        inventoryItems: [],
        timeEntries: []
      },
      {
        id: 'sample-wo-2',
        status: 'pending',
        description: 'Brake inspection and replacement',
        customer_name: 'Jane Smith',
        customer: 'Jane Smith',
        technician: 'Sarah Wilson',
        date: new Date().toISOString(),
        priority: 'high',
        location: 'Bay 2',
        notes: 'Customer reports squeaking noise',
        vehicle_make: 'Honda',
        vehicle_model: 'Civic',
        vehicle_year: '2019',
        created_at: new Date().toISOString(),
        total_cost: 450.00,
        estimated_hours: 3.0,
        inventoryItems: [],
        timeEntries: []
      }
    ];
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetch) return false;
    return Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION;
  }

  private async waitForCurrentRequest(): Promise<WorkOrder[]> {
    // Simple polling mechanism to wait for current request
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (this.isLoading && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    return this.cache;
  }

  async getWorkOrder(id: string): Promise<WorkOrder | null> {
    const workOrders = await this.getAllWorkOrders();
    return workOrders.find(wo => wo.id === id) || null;
  }

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder | null> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      const index = this.cache.findIndex(wo => wo.id === id);
      if (index !== -1) {
        this.cache[index] = this.normalizeWorkOrder(data);
      }

      return this.normalizeWorkOrder(data);
    } catch (error) {
      console.error('HardcodedWorkOrderService: Error updating work order:', error);
      throw error;
    }
  }

  async deleteWorkOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      this.cache = this.cache.filter(wo => wo.id !== id);
    } catch (error) {
      console.error('HardcodedWorkOrderService: Error deleting work order:', error);
      throw error;
    }
  }

  getCachedWorkOrders(): WorkOrder[] {
    return this.cache;
  }

  getCacheStatus(): CacheStatus {
    const now = Date.now();
    const lastFetch = this.lastFetch;
    const cacheAge = lastFetch ? now - lastFetch.getTime() : 0;

    return {
      size: this.cache.length,
      lastUpdated: lastFetch,
      lastFetch: lastFetch,
      cacheAge: cacheAge
    };
  }

  clearCache(): void {
    this.cache = [];
    this.lastFetch = null;
  }
}

export const hardcodedWorkOrderService = new HardcodedWorkOrderService();
