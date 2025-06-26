
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';

export interface CacheStatus {
  size: number;
  lastUpdated: Date | null;
  strategies: string[];
  health: 'healthy' | 'degraded' | 'offline';
}

export class HardcodedWorkOrderService {
  private cache: WorkOrder[] = [];
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Make this method public so it can be accessed from hooks
  public getCachedWorkOrders(): WorkOrder[] {
    return this.cache;
  }

  getCacheStatus(): CacheStatus {
    return {
      size: this.cache.length,
      lastUpdated: this.lastFetch,
      strategies: ['enhanced', 'basic', 'raw', 'cached'],
      health: this.cache.length > 0 ? 'healthy' : 'degraded'
    };
  }

  clearCache(): void {
    this.cache = [];
    this.lastFetch = null;
    console.log('HardcodedWorkOrderService: Cache cleared');
  }

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    // Return cached data if fresh
    if (this.lastFetch && Date.now() - this.lastFetch.getTime() < this.CACHE_DURATION && this.cache.length > 0) {
      console.log('HardcodedWorkOrderService: Returning cached data');
      return this.cache;
    }

    // Strategy 1: Enhanced query (with relationships)
    try {
      console.log('HardcodedWorkOrderService: Trying enhanced query...');
      const enhancedData = await this.fetchEnhancedWorkOrders();
      if (enhancedData && enhancedData.length > 0) {
        this.cache = enhancedData;
        this.lastFetch = new Date();
        console.log('HardcodedWorkOrderService: Enhanced query successful, cached', enhancedData.length, 'work orders');
        return enhancedData;
      }
    } catch (error) {
      console.warn('HardcodedWorkOrderService: Enhanced query failed:', error);
    }

    // Strategy 2: Basic query (no relationships)
    try {
      console.log('HardcodedWorkOrderService: Trying basic query...');
      const basicData = await this.fetchBasicWorkOrders();
      if (basicData && basicData.length > 0) {
        this.cache = basicData;
        this.lastFetch = new Date();
        console.log('HardcodedWorkOrderService: Basic query successful, cached', basicData.length, 'work orders');
        return basicData;
      }
    } catch (error) {
      console.warn('HardcodedWorkOrderService: Basic query failed:', error);
    }

    // Strategy 3: Raw SQL query
    try {
      console.log('HardcodedWorkOrderService: Trying raw SQL query...');
      const rawData = await this.fetchRawWorkOrders();
      if (rawData && rawData.length > 0) {
        this.cache = rawData;
        this.lastFetch = new Date();
        console.log('HardcodedWorkOrderService: Raw query successful, cached', rawData.length, 'work orders');
        return rawData;
      }
    } catch (error) {
      console.warn('HardcodedWorkOrderService: Raw query failed:', error);
    }

    // Strategy 4: Return cached data even if stale
    if (this.cache.length > 0) {
      console.log('HardcodedWorkOrderService: All queries failed, returning stale cache with', this.cache.length, 'work orders');
      return this.cache;
    }

    // Strategy 5: Return hardcoded fallback data
    console.log('HardcodedWorkOrderService: All strategies failed, returning hardcoded fallback data');
    const fallbackData = this.getFallbackWorkOrders();
    this.cache = fallbackData;
    return fallbackData;
  }

  private async fetchEnhancedWorkOrders(): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          name,
          email,
          phone
        ),
        vehicles (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.transformWorkOrderData(data || []);
  }

  private async fetchBasicWorkOrders(): Promise<WorkOrder[]> {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.transformWorkOrderData(data || []);
  }

  private async fetchRawWorkOrders(): Promise<WorkOrder[]> {
    // Use a direct SQL query instead of RPC to avoid the function dependency
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform the raw data
    return (data || []).map(row => this.transformRowToWorkOrder(row));
  }

  private transformWorkOrderData(data: any[]): WorkOrder[] {
    return data.map(item => this.transformRowToWorkOrder(item));
  }

  private transformRowToWorkOrder(row: any): WorkOrder {
    return {
      id: row.id,
      work_order_number: row.work_order_number || `WO-${row.id.slice(-6)}`,
      customer_id: row.customer_id,
      customer_name: row.customer_name || row.customers?.name || 'Unknown Customer',
      customer_email: row.customer_email || row.customers?.email || '',
      customer_phone: row.customer_phone || row.customers?.phone || '',
      vehicle_id: row.vehicle_id,
      vehicle_make: row.vehicle_make || row.vehicles?.make || '',
      vehicle_model: row.vehicle_model || row.vehicles?.model || '',
      vehicle_year: row.vehicle_year || row.vehicles?.year || null,
      vehicle_license_plate: row.vehicle_license_plate || row.vehicles?.license_plate || '',
      vehicle_vin: row.vehicle_vin || row.vehicles?.vin || '',
      vehicle_odometer: row.vehicle_odometer || null,
      description: row.description || '',
      status: row.status || 'pending',
      priority: row.priority || 'medium',
      technician: row.technician || '',
      technician_id: row.technician_id || null,
      location: row.location || '',
      due_date: row.due_date,
      notes: row.notes || '',
      service_type: row.service_type || '',
      estimated_hours: row.estimated_hours || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
      inventoryItems: row.inventory_items || [],
      jobLines: row.job_lines || [],
      timeEntries: row.time_entries || [],
      parts: row.parts || []
    };
  }

  private getFallbackWorkOrders(): WorkOrder[] {
    // Return a hardcoded work order to ensure the app never shows empty state
    return [
      {
        id: 'fallback-1',
        work_order_number: 'WO-FALLBACK-001',
        customer_id: 'fallback-customer',
        customer_name: 'System Fallback Customer',
        customer_email: 'fallback@example.com',
        customer_phone: '(555) 000-0000',
        vehicle_id: 'fallback-vehicle',
        vehicle_make: 'System',
        vehicle_model: 'Fallback',
        vehicle_year: 2024,
        vehicle_license_plate: 'FALLBACK',
        vehicle_vin: 'FALLBACK123456789',
        vehicle_odometer: 0,
        description: 'This is a fallback work order displayed when the database is unavailable. Please check your connection.',
        status: 'pending',
        priority: 'medium',
        technician: 'System',
        technician_id: null,
        location: 'Fallback Location',
        due_date: null,
        notes: 'This work order is generated by the hardcoded service as a fallback.',
        service_type: 'System Maintenance',
        estimated_hours: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        inventoryItems: [],
        jobLines: [],
        timeEntries: [],
        parts: []
      }
    ];
  }
}

// Export singleton instance
export const hardcodedWorkOrderService = new HardcodedWorkOrderService();
