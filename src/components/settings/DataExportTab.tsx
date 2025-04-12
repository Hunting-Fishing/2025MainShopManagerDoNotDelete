
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SaveIcon, FileDown, Calendar, Clock, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { saveAs } from 'file-saver';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function DataExportTab() {
  const [selectedEntities, setSelectedEntities] = useState<Record<string, boolean>>({
    customers: true,
    vehicles: true,
    workOrders: true,
    inventory: false,
    communications: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [scheduleType, setScheduleType] = useState<string>('oneTime');

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

      // Create appropriate file based on format
      let blob;
      let filename = `shop-data-export-${new Date().toISOString().split('T')[0]}`;

      if (exportFormat === 'json') {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename += '.json';
      } else if (exportFormat === 'csv') {
        // In a real implementation, convert JSON to CSV
        blob = new Blob(['csv content would go here'], { type: 'text/csv' });
        filename += '.csv';
      } else { // xlsx
        // In a real implementation, convert JSON to XLSX
        blob = new Blob(['xlsx content would go here'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        filename += '.xlsx';
      }
      
      saveAs(blob, filename);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      // Handle error
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="oneTime">
        <TabsList>
          <TabsTrigger value="oneTime">One-Time Export</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="oneTime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Export Data
              </CardTitle>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>File Format</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-center justify-center">
                        <RadioGroupItem value="json" id="json" checked={exportFormat === 'json'} onClick={() => setExportFormat('json')} />
                        <FileJson className="h-4 w-4 mt-1 text-blue-500" />
                      </div>
                      <Label htmlFor="json">JSON</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-center justify-center">
                        <RadioGroupItem value="csv" id="csv" checked={exportFormat === 'csv'} onClick={() => setExportFormat('csv')} />
                        <FileText className="h-4 w-4 mt-1 text-green-500" />
                      </div>
                      <Label htmlFor="csv">CSV</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-center justify-center">
                        <RadioGroupItem value="xlsx" id="xlsx" checked={exportFormat === 'xlsx'} onClick={() => setExportFormat('xlsx')} />
                        <FileSpreadsheet className="h-4 w-4 mt-1 text-purple-500" />
                      </div>
                      <Label htmlFor="xlsx">Excel</Label>
                    </div>
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
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Exports
              </CardTitle>
              <CardDescription>
                Configure regular automated data exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <RadioGroup value={scheduleType} onValueChange={setScheduleType} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">
                      Weekly Export (Every Monday at 1:00 AM)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">
                      Monthly Export (1st day of month at 1:00 AM)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">
                      Custom Schedule
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {scheduleType === 'custom' && (
                <div className="space-y-4 border rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select defaultValue="1am">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12am">12:00 AM</SelectItem>
                          <SelectItem value="1am">1:00 AM</SelectItem>
                          <SelectItem value="2am">2:00 AM</SelectItem>
                          <SelectItem value="3am">3:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Export Settings</p>
                <div className="space-y-2">
                  {['customers', 'vehicles', 'workOrders', 'inventory'].map(entity => (
                    <div key={entity} className="flex items-center space-x-2">
                      <Checkbox id={`scheduled-${entity}`} defaultChecked={entity === 'customers'} />
                      <label 
                        htmlFor={`scheduled-${entity}`} 
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Include {entity === 'workOrders' ? 'work orders' : entity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button>
                  <Clock className="mr-2 h-4 w-4" />
                  Schedule Exports
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Export Jobs</CardTitle>
              <CardDescription>
                View and manage your scheduled exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-6">
                No scheduled exports configured
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
