
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Supplier {
  name: string;
  type?: string;
  region?: string;
}

interface SupplierSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function SupplierSelector({ value, onValueChange }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching suppliers from database...');

        const { data, error } = await supabase
          .from('inventory_suppliers')
          .select('name, type, region')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching suppliers:', error);
          setError('Failed to load suppliers');
          // Fallback to basic suppliers
          setSuppliers([
            { name: 'NAPA Auto Parts', type: 'Retail & Wholesale', region: 'North America' },
            { name: 'AutoZone', type: 'Retail', region: 'North America' },
            { name: 'Advance Auto Parts', type: 'Retail & Wholesale', region: 'North America' },
            { name: "O'Reilly Auto Parts", type: 'Retail & Wholesale', region: 'North America' },
            { name: 'Parts Plus', type: 'Wholesale', region: 'North America' }
          ]);
        } else {
          const supplierData = data?.map(supplier => ({
            name: supplier.name,
            type: supplier.type || undefined,
            region: supplier.region || undefined
          })) || [];
          console.log('Suppliers loaded:', supplierData.length, 'suppliers');
          setSuppliers(supplierData);
        }
      } catch (err) {
        console.error('Error setting up suppliers:', err);
        setError('Failed to load suppliers');
        // Fallback suppliers
        setSuppliers([
          { name: 'NAPA Auto Parts', type: 'Retail & Wholesale', region: 'North America' },
          { name: 'AutoZone', type: 'Retail', region: 'North America' },
          { name: 'Advance Auto Parts', type: 'Retail & Wholesale', region: 'North America' },
          { name: "O'Reilly Auto Parts", type: 'Retail & Wholesale', region: 'North America' },
          { name: 'Parts Plus', type: 'Wholesale', region: 'North America' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Supplier</Label>
        <div className="flex items-center gap-2 p-2 border rounded bg-white">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading suppliers...</span>
        </div>
      </div>
    );
  }

  if (error && suppliers.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Supplier</Label>
        <div className="p-2 border rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 bg-slate-100 p-4 rounded-lg">
      <Label className="text-sm font-medium text-slate-700">Supplier</Label>
      <Select value={value || ''} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white border-slate-300 text-slate-900">
          <SelectValue placeholder="Select a supplier" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto bg-white border-slate-200 shadow-lg">
          {suppliers.length === 0 ? (
            <SelectItem value="no-suppliers" disabled>
              No suppliers available
            </SelectItem>
          ) : (
            suppliers.map((supplier) => (
              <SelectItem key={supplier.name} value={supplier.name} className="hover:bg-slate-50 focus:bg-slate-100">
                <div className="flex flex-col items-start w-full">
                  <span className="font-medium text-slate-900">{supplier.name}</span>
                  {(supplier.type || supplier.region) && (
                    <div className="flex gap-2 text-xs text-slate-600 mt-0.5">
                      {supplier.type && (
                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          {supplier.type}
                        </span>
                      )}
                      {supplier.region && (
                        <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                          {supplier.region}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
