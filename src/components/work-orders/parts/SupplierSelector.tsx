
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupplierSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function SupplierSelector({ value, onValueChange }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<string[]>([]);
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
          .select('name')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching suppliers:', error);
          setError('Failed to load suppliers');
          // Fallback to basic suppliers
          setSuppliers([
            'NAPA Auto Parts',
            'AutoZone',
            'Advance Auto Parts',
            'O\'Reilly Auto Parts',
            'Parts Plus'
          ]);
        } else {
          const supplierNames = data?.map(supplier => supplier.name) || [];
          console.log('Suppliers loaded:', supplierNames.length, 'suppliers');
          setSuppliers(supplierNames);
        }
      } catch (err) {
        console.error('Error setting up suppliers:', err);
        setError('Failed to load suppliers');
        // Fallback suppliers
        setSuppliers([
          'NAPA Auto Parts',
          'AutoZone',
          'Advance Auto Parts',
          'O\'Reilly Auto Parts',
          'Parts Plus'
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
              <SelectItem key={supplier} value={supplier} className="hover:bg-slate-50 focus:bg-slate-100">
                {supplier}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
