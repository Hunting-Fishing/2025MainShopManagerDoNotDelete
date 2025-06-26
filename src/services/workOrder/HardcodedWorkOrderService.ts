
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

interface CachedWorkOrder extends WorkOrder {
  cachedAt: string;
}

export class HardcodedWorkOrderService {
  private static instance: HardcodedWorkOrderService;
  private cache: Map<string, CachedWorkOrder> = new Map();
  private lastSuccessfulFetch: Date | null = null;

  static getInstance(): HardcodedWorkOrderService {
    if (!HardcodedWorkOrderService.instance) {
      HardcodedWorkOrderService.instance = new HardcodedWorkOrderService();
    }
    return HardcodedWorkOrderService.instance;
  }

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    console.log('🔄 HardcodedWorkOrderService: Fetching work orders with multiple strategies...');

    // Strategy 1: Enhanced query with relationships
    try {
      return await this.fetchWithEnhancedQuery();
    } catch (error) {
      console.warn('⚠️ Enhanced query failed, trying basic query:', error);
    }

    // Strategy 2: Basic query without relationships
    try {
      return await this.fetchWithBasicQuery();
    } catch (error) {
      console.warn('⚠️ Basic query failed, trying raw SQL:', error);
    }

    // Strategy 3: Raw SQL query
    try {
      return await this.fetchWithRawSQL();
    } catch (error) {
      console.warn('⚠️ Raw SQL failed, using cached data:', error);
    }

    // Strategy 4: Return cached data
    return this.getCachedWorkOrders();
  }

  private async fetchWithEnhancedQuery(): Promise<WorkOrder[]> {
    console.log('📊 Attempting enhanced query...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
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

    const workOrders = this.transformEnhancedData(data || []);
    this.updateCache(workOrders);
    this.lastSuccessfulFetch = new Date();
    
    console.log('✅ Enhanced query successful:', workOrders.length, 'work orders');
    return workOrders;
  }

  private async fetchWithBasicQuery(): Promise<WorkOrder[]> {
    console.log('📋 Attempting basic query...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const workOrders = this.transformBasicData(data || []);
    this.updateCache(workOrders);
    this.lastSuccessfulFetch = new Date();
    
    console.log('✅ Basic query successful:', workOrders.length, 'work orders');
    return workOrders;
  }

  private async fetchWithRawSQL(): Promise<WorkOrder[]> {
    console.log('🔧 Attempting raw SQL query...');
    
    const { data, error } = await supabase.rpc('get_work_orders_raw');

    if (error) {
      // If the RPC doesn't exist, fall back to direct query
      const { data: directData, error: directError } = await supabase
        .from('work_orders')
        .select('*');
      
      if (directError) throw directError;
      
      const workOrders = this.transformBasicData(directData || []);
      this.updateCache(workOrders);
      return workOrders;
    }

    const workOrders = this.transformBasicData(data || []);
    this.updateCache(workOrders);
    this.lastSuccessfulFetch = new Date();
    
    console.log('✅ Raw SQL query successful:', workOrders.length, 'work orders');
    return workOrders;
  }

  private getCachedWorkOrders(): WorkOrder[] {
    console.log('💾 Using cached work orders...');
    
    const cached = Array.from(this.cache.values()).map(cached => {
      const { cachedAt, ...workOrder } = cached;
      return workOrder;
    });

    console.log('📦 Returned', cached.length, 'cached work orders');
    return cached;
  }

  private transformEnhancedData(data: any[]): WorkOrder[] {
    return data.map(item => ({
      id: item.id,
      status: item.status || 'pending',
      description: item.description || '',
      customer_id: item.customer_id,
      vehicle_id: item.vehicle_id,
      technician_id: item.technician_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Enhanced customer data
      customer_name: item.customers ? 
        `${item.customers.first_name || ''} ${item.customers.last_name || ''}`.trim() : 
        'Unknown Customer',
      customer_first_name: item.customers?.first_name,
      customer_last_name: item.customers?.last_name,
      customer_email: item.customers?.email,
      customer_phone: item.customers?.phone,
      // Enhanced vehicle data
      vehicle_make: item.vehicles?.make,
      vehicle_model: item.vehicles?.model,
      vehicle_year: item.vehicles?.year?.toString(),
      vehicle_license_plate: item.vehicles?.license_plate,
      vehicle_vin: item.vehicles?.vin,
      // All other fields
      ...item
    }));
  }

  private transformBasicData(data: any[]): WorkOrder[] {
    return data.map(item => ({
      id: item.id,
      status: item.status || 'pending',
      description: item.description || '',
      customer_id: item.customer_id,
      vehicle_id: item.vehicle_id,
      technician_id: item.technician_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      customer_name: item.customer_name || 'Unknown Customer',
      // Use existing fields or fallbacks
      customer_first_name: item.customer_first_name,
      customer_last_name: item.customer_last_name,
      customer_email: item.customer_email,
      customer_phone: item.customer_phone,
      vehicle_make: item.vehicle_make,
      vehicle_model: item.vehicle_model,
      vehicle_year: item.vehicle_year,
      vehicle_license_plate: item.vehicle_license_plate,
      vehicle_vin: item.vehicle_vin,
      ...item
    }));
  }

  private updateCache(workOrders: WorkOrder[]): void {
    this.cache.clear();
    workOrders.forEach(workOrder => {
      this.cache.set(workOrder.id, {
        ...workOrder,
        cachedAt: new Date().toISOString()
      });
    });
    console.log('💾 Cache updated with', workOrders.length, 'work orders');
  }

  getCacheStatus(): {
    size: number;
    lastFetch: Date | null;
    cacheAge: number | null;
  } {
    return {
      size: this.cache.size,
      lastFetch: this.lastSuccessfulFetch,
      cacheAge: this.lastSuccessfulFetch ? 
        Date.now() - this.lastSuccessfulFetch.getTime() : null
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}

export const hardcodedWorkOrderService = HardcodedWorkOrderService.getInstance();
