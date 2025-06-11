
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';

export function PartsSearchAndFilter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Sample data for demonstration
  const sampleParts: WorkOrderPart[] = [
    {
      id: '1',
      work_order_id: 'wo-1',
      part_number: 'BR-001',
      name: 'Brake Pads',
      description: 'Front brake pads',
      quantity: 2,
      unit_price: 45.99,
      total_price: 91.98,
      status: 'installed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'Brakes',
      supplierName: 'AutoParts Inc',
      supplierCost: 35.00,
      supplierSuggestedRetailPrice: 50.99
    }
  ];

  const filteredParts = sampleParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.part_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || part.category === category;
    const matchesStatus = !status || part.status === status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Brakes">Brakes</SelectItem>
                <SelectItem value="Engine">Engine</SelectItem>
                <SelectItem value="Transmission">Transmission</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => {
                setSearchTerm('');
                setCategory('');
                setStatus('');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results ({filteredParts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredParts.map((part) => (
              <div key={part.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{part.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {part.part_number} | {part.category} | Qty: {part.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${part.total_price.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground capitalize">{part.status}</div>
                </div>
              </div>
            ))}
            {filteredParts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No parts found matching your search criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
