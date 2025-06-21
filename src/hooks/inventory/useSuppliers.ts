
import { useState, useEffect } from 'react';
import { getInventorySuppliers } from '@/services/inventory/supplierService';

interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get supplier names from the existing service
        const supplierNames = await getInventorySuppliers();
        
        // Convert to supplier objects (since we only have names, we'll use name as both id and name)
        const supplierObjects = supplierNames.map(name => ({
          id: name,
          name: name
        }));
        
        setSuppliers(supplierObjects);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError('Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  return { suppliers, loading, error };
}
