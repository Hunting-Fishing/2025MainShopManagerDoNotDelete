
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SupplierSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function SupplierSelector({ value, onValueChange }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // For now, use static suppliers. In the future, this could fetch from Supabase
    const defaultSuppliers = [
      'NAPA Auto Parts',
      'AutoZone',
      'Advance Auto Parts',
      'O\'Reilly Auto Parts',
      'Parts Plus',
      'Genuine Parts Company',
      'Federal-Mogul',
      'AC Delco',
      'Bosch',
      'Denso',
      'NGK',
      'Fram',
      'Castrol',
      'Mobil 1',
      'Valvoline'
    ];
    
    setSuppliers(defaultSuppliers);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Supplier</Label>
        <div className="flex items-center gap-2 p-2 border rounded">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading suppliers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Supplier</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a supplier" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {suppliers.length === 0 ? (
            <SelectItem value="no-suppliers" disabled>
              No suppliers available
            </SelectItem>
          ) : (
            suppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
