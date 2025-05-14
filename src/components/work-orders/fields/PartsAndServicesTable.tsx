
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { HierarchicalServiceSelector } from './services/HierarchicalServiceSelector';

export interface PartsAndServicesTableProps {
  items: any[];
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export function PartsAndServicesTable({ items, setItems }: PartsAndServicesTableProps) {
  const [showServiceSelector, setShowServiceSelector] = React.useState(false);
  
  const handleAddService = (service: any) => {
    setItems([...items, service]);
    setShowServiceSelector(false);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Parts & Services</span>
          <Button 
            onClick={() => setShowServiceSelector(!showServiceSelector)} 
            variant="outline" 
            size="sm"
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {showServiceSelector && (
          <div className="p-4 border-b">
            <HierarchicalServiceSelector onSelectService={handleAddService} />
          </div>
        )}
        
        {items.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-slate-500">Service</th>
                <th className="text-left p-3 text-xs font-medium text-slate-500">Category</th>
                <th className="text-left p-3 text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">
                    <Button 
                      onClick={() => handleRemoveItem(index)} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-slate-500">
            No services or parts added yet. Click "Add Service" to begin.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
