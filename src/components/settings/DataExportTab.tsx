
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SaveIcon, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import { supabase } from '@/lib/supabase';

export function DataExportTab() {
  const [selectedEntities, setSelectedEntities] = useState<Record<string, boolean>>({
    customers: true,
    vehicles: true,
    workOrders: true,
    inventory: false,
    communications: false
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // Handle checkbox change
  const handleCheckboxChange = (entity: string) => {
    setSelectedEntities({
      ...selectedEntities,
      [entity]: !selectedEntities[entity]
    });
  };
  
  // Function to export data
  const exportData = async () => {
    try {
      setIsExporting(true);
      
      const exportData: Record<string, any> = {};
      
      // Fetch customers if selected
      if (selectedEntities.customers) {
        const { data: customers } = await supabase.from('customers').select('*');
        exportData.customers = customers || [];
      }
      
      // Fetch vehicles if selected
      if (selectedEntities.vehicles) {
        const { data: vehicles } = await supabase.from('vehicles').select('*');
        exportData.vehicles = vehicles || [];
      }
      
      // Fetch work orders if selected
      if (selectedEntities.workOrders) {
        const { data: workOrders } = await supabase.from('work_orders').select('*');
        exportData.workOrders = workOrders || [];
      }
      
      // Fetch inventory if selected
      if (selectedEntities.inventory) {
        const { data: inventory } = await supabase.from('inventory_items').select('*');
        exportData.inventory = inventory || [];
      }
      
      // Fetch communications if selected
      if (selectedEntities.communications) {
        const { data: communications } = await supabase.from('customer_communications').select('*');
        exportData.communications = communications || [];
      }
      
      // Create a JSON blob and save it
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      saveAs(blob, `shop-data-export-${new Date().toISOString().split('T')[0]}.json`);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      // Handle error
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Select what data you want to export from your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Choose which entities to include in the export:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="customers" 
                  checked={selectedEntities.customers}
                  onCheckedChange={() => handleCheckboxChange('customers')}
                />
                <label htmlFor="customers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Customers
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vehicles" 
                  checked={selectedEntities.vehicles}
                  onCheckedChange={() => handleCheckboxChange('vehicles')}
                />
                <label htmlFor="vehicles" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Vehicles
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="workOrders" 
                  checked={selectedEntities.workOrders}
                  onCheckedChange={() => handleCheckboxChange('workOrders')}
                />
                <label htmlFor="workOrders" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Work Orders
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="inventory" 
                  checked={selectedEntities.inventory}
                  onCheckedChange={() => handleCheckboxChange('inventory')}
                />
                <label htmlFor="inventory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Inventory Items
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="communications" 
                  checked={selectedEntities.communications}
                  onCheckedChange={() => handleCheckboxChange('communications')}
                />
                <label htmlFor="communications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Customer Communications
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={exportData} 
              disabled={isExporting || !Object.values(selectedEntities).some(v => v)}
            >
              {isExporting ? (
                <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
