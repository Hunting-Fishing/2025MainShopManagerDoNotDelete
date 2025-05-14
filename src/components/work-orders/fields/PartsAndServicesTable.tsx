import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { HierarchicalServiceSelector } from "@/components/work-orders/fields/services/HierarchicalServiceSelector";

interface PartsAndServicesTableProps {
  onServicesChange: (services: any[]) => void;
  services: any[];
}

export function PartsAndServicesTable({ onServicesChange, services }: PartsAndServicesTableProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [selectedServices, setSelectedServices] = useState(services);

  const handleServiceSelect = (service: any) => {
    const updatedServices = [...selectedServices, service];
    setSelectedServices(updatedServices);
    onServicesChange(updatedServices);
    setShowSelector(false);
  };

  const handleRemoveService = (id: string) => {
    const updatedServices = selectedServices.filter(service => service.id !== id);
    setSelectedServices(updatedServices);
    onServicesChange(updatedServices);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Parts & Services</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedServices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Time</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.jobName}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {service.categoryName} &gt; {service.subcategoryName}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${service.price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell className="text-right">{service.estimatedTime || 0} min</TableCell>
                  <TableCell className="text-right">{service.quantity}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No services added yet. Click the button below to add services.
          </div>
        )}

        {showSelector ? (
          <div className="mt-4 border rounded-md p-4 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-lg font-medium mb-4">Select Service</h3>
            <HierarchicalServiceSelector onServiceSelect={handleServiceSelect} />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowSelector(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <Button 
              type="button" 
              onClick={() => setShowSelector(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
