
import { supabase } from '@/integrations/supabase/client';

export async function validateDatabaseStructure() {
  try {
    console.log('Validating database structure for service tables...');
    
    // Check if all required tables exist and are accessible
    const tables = ['service_sectors', 'service_categories', 'service_subcategories', 'service_jobs'];
    const results = [];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`Error accessing table ${table}:`, error);
          results.push({ table, accessible: false, error: error.message });
        } else {
          console.log(`Table ${table} is accessible`);
          results.push({ table, accessible: true, error: null });
        }
      } catch (err) {
        console.error(`Exception accessing table ${table}:`, err);
        results.push({ table, accessible: false, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error validating database structure:', error);
    throw error;
  }
}

export async function testDatabaseOperations() {
  try {
    console.log('Testing basic database operations...');
    
    // Test insert operation
    const testSector = {
      name: `test_sector_${Date.now()}`,
      description: 'Test sector for validation',
      position: 999
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('service_sectors')
      .insert(testSector)
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert test failed:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log('Insert test successful:', insertData);
    
    // Test delete operation to clean up
    const { error: deleteError } = await supabase
      .from('service_sectors')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('Delete test failed:', deleteError);
    } else {
      console.log('Delete test successful');
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error testing database operations:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
