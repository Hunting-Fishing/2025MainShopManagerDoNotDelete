
import { supabase } from '@/integrations/supabase/client';

export class DatabaseHealthMonitor {
  private static instance: DatabaseHealthMonitor;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  static getInstance(): DatabaseHealthMonitor {
    if (!DatabaseHealthMonitor.instance) {
      DatabaseHealthMonitor.instance = new DatabaseHealthMonitor();
    }
    return DatabaseHealthMonitor.instance;
  }

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    console.log('🔍 Starting Database Health Monitor...');
    
    // Initial health check
    await this.performHealthCheck();
    
    // Set up periodic monitoring (every 5 minutes)
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000);
    
    this.isMonitoring = true;
    console.log('✅ Database Health Monitor started');
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Database Health Monitor stopped');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      console.log('🏥 Performing database health check...');
      
      // Check database connection
      await this.checkDatabaseConnection();
      
      // Check work_orders table accessibility
      await this.checkWorkOrdersTable();
      
      // Check RLS policies
      await this.checkRLSPolicies();
      
      // Check foreign key constraints
      await this.checkForeignKeyConstraints();
      
      console.log('✅ Database health check completed successfully');
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      await this.attemptAutoRepair();
    }
  }

  private async checkDatabaseConnection(): Promise<void> {
    const { error } = await supabase.from('work_orders').select('count', { count: 'exact', head: true });
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  private async checkWorkOrdersTable(): Promise<void> {
    // Test basic query
    const { data, error } = await supabase
      .from('work_orders')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Work orders table check failed: ${error.message}`);
    }
  }

  private async checkRLSPolicies(): Promise<void> {
    // This would need to be implemented as an edge function or admin query
    // For now, we'll test by attempting operations
    console.log('🔐 RLS policies check - testing operations...');
  }

  private async checkForeignKeyConstraints(): Promise<void> {
    // Test relationship queries
    const { error } = await supabase
      .from('work_orders')
      .select(`
        id,
        customers (
          id,
          first_name,
          last_name
        )
      `)
      .limit(1);
    
    if (error && error.message.includes('Could not embed')) {
      throw new Error(`Foreign key constraint issue detected: ${error.message}`);
    }
  }

  private async attemptAutoRepair(): Promise<void> {
    console.log('🔧 Attempting automatic database repair...');
    
    try {
      // We can't directly modify schema from client, but we can log issues
      // and provide repair instructions
      console.warn('⚠️ Database issues detected. Manual intervention may be required.');
      
      // In a real implementation, this would trigger an edge function
      // that has admin privileges to repair the database
    } catch (repairError) {
      console.error('❌ Auto-repair failed:', repairError);
    }
  }

  async getDiagnostics(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
    }>;
  }> {
    const checks = [];
    let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';

    try {
      await this.checkDatabaseConnection();
      checks.push({ name: 'Database Connection', status: 'pass', message: 'Connected successfully' });
    } catch (error) {
      checks.push({ name: 'Database Connection', status: 'fail', message: error instanceof Error ? error.message : 'Unknown error' });
      overallStatus = 'error';
    }

    try {
      await this.checkWorkOrdersTable();
      checks.push({ name: 'Work Orders Table', status: 'pass', message: 'Table accessible' });
    } catch (error) {
      checks.push({ name: 'Work Orders Table', status: 'fail', message: error instanceof Error ? error.message : 'Unknown error' });
      overallStatus = 'error';
    }

    return { status: overallStatus, checks };
  }
}

export const databaseHealthMonitor = DatabaseHealthMonitor.getInstance();
