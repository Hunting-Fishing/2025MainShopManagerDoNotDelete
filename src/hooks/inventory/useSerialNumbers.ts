
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SerialNumber {
  id: string;
  inventoryItemId: string;
  serialNumber: string;
  status: string;
  notes?: string;
  addedDate: string;
  lastUpdated: string;
}

export function useSerialNumbers(itemId: string) {
  const [loading, setLoading] = useState(false);
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[] | null>(null);

  const fetchSerialNumbers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_serial_numbers')
        .select('*')
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to client format
      const transformedData: SerialNumber[] = data.map(item => ({
        id: item.id,
        inventoryItemId: item.inventory_item_id,
        serialNumber: item.serial_number,
        status: item.status,
        notes: item.notes,
        addedDate: item.created_at,
        lastUpdated: item.updated_at
      }));
      
      setSerialNumbers(transformedData);
      
    } catch (err) {
      console.error('Error fetching serial numbers:', err);
      toast({
        title: 'Error',
        description: 'Failed to load serial numbers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (itemId) {
      fetchSerialNumbers();
    }
  }, [itemId]);
  
  const addSerialNumber = async (serialNumber: string, status: string = 'in_stock', notes?: string) => {
    setLoading(true);
    try {
      // Check if serial number already exists for this item
      const { data: existingData, error: checkError } = await supabase
        .from('inventory_serial_numbers')
        .select('id')
        .eq('inventory_item_id', itemId)
        .eq('serial_number', serialNumber)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (existingData && existingData.length > 0) {
        toast({
          title: 'Serial Number Exists',
          description: `Serial number ${serialNumber} already exists for this item`,
          variant: 'destructive'
        });
        return;
      }
      
      // Add new serial number
      const { data, error } = await supabase
        .from('inventory_serial_numbers')
        .insert({
          inventory_item_id: itemId,
          serial_number: serialNumber,
          status: status,
          notes: notes
        });
        
      if (error) throw error;
      
      toast({
        title: 'Serial Number Added',
        description: `Serial number ${serialNumber} has been added`,
        variant: 'default'
      });
      
      await fetchSerialNumbers();
      
    } catch (err) {
      console.error('Error adding serial number:', err);
      toast({
        title: 'Error',
        description: 'Failed to add serial number',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteSerialNumber = async (serialId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_serial_numbers')
        .delete()
        .eq('id', serialId);
        
      if (error) throw error;
      
      toast({
        title: 'Serial Number Deleted',
        description: 'Serial number has been removed',
        variant: 'default'
      });
      
      await fetchSerialNumbers();
      
    } catch (err) {
      console.error('Error deleting serial number:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete serial number',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateSerialStatus = async (serialId: string, newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_serial_numbers')
        .update({ status: newStatus })
        .eq('id', serialId);
        
      if (error) throw error;
      
      toast({
        title: 'Serial Status Updated',
        description: 'Serial number status has been updated',
        variant: 'default'
      });
      
      await fetchSerialNumbers();
      
    } catch (err) {
      console.error('Error updating serial status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update serial number status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    serialNumbers,
    addSerialNumber,
    deleteSerialNumber,
    updateSerialStatus,
    refreshSerialNumbers: fetchSerialNumbers
  };
}
