
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
      // Using a mock implementation since the actual table doesn't exist
      // This simulates what would happen when the table exists
      
      // Mocked data until we create the table
      const mockData: SerialNumber[] = [
        {
          id: "1",
          inventoryItemId: itemId,
          serialNumber: "SN123456789",
          status: "in_stock",
          notes: "Brand new item",
          addedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ];
      
      setSerialNumbers(mockData);
      
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
      // Mocked implementation until table exists
      
      // Mock check for duplicate
      if (serialNumbers?.some(s => s.serialNumber === serialNumber)) {
        toast({
          title: 'Serial Number Exists',
          description: `Serial number ${serialNumber} already exists for this item`,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      toast({
        title: 'Serial Number Added',
        description: `Serial number ${serialNumber} has been added`,
        variant: 'default'
      });
      
      // Update local state
      const newSerial: SerialNumber = {
        id: Date.now().toString(), // Mock ID
        inventoryItemId: itemId,
        serialNumber: serialNumber,
        status: status,
        notes: notes,
        addedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      setSerialNumbers(prev => [...(prev || []), newSerial]);
      
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
      // Mocked implementation until table exists
      setSerialNumbers(prev => prev ? prev.filter(s => s.id !== serialId) : null);
      
      toast({
        title: 'Serial Number Deleted',
        description: 'Serial number has been removed',
        variant: 'default'
      });
      
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
      // Mocked implementation until table exists
      setSerialNumbers(prev => 
        prev ? prev.map(s => 
          s.id === serialId 
            ? { ...s, status: newStatus, lastUpdated: new Date().toISOString() } 
            : s
        ) : null
      );
      
      toast({
        title: 'Serial Status Updated',
        description: 'Serial number status has been updated',
        variant: 'default'
      });
      
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
