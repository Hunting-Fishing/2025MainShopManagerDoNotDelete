
import React, { useState } from "react";
import { HierarchicalServiceSelector } from "./services/HierarchicalServiceSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface ServiceItem {
  id: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  jobId: string;
  jobName: string;
  estimatedTime?: number;
  price?: number;
  quantity: number;
}

interface ServicesSectionProps {
  onServicesChange: (services: ServiceItem[]) => void;
}

export function ServicesSection({ onServicesChange }: ServicesSectionProps) {
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const handleServiceSelect = (service: Omit<ServiceItem, 'id' | 'quantity'>) => {
    const newService = {
      ...service,
      id: `${service.jobId}-${Date.now()}`, // Create a unique ID
      quantity: 1
    };

    const updatedServices = [...selectedServices, newService];
    setSelectedServices(updatedServices);
    onServicesChange(updatedServices);
    setShowSelector(false);
  };

  const handleRemoveService = (id: string) => {
    const updatedServices = selectedServices.filter(service => service.id !== id);
    setSelectedServices(updatedServices);
    onServicesChange(updatedServices);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedServices = selectedServices.map(service => 
      service.id === id ? { ...service, quantity: newQuantity } : service
    );
    
    setSelectedServices(updatedServices);
    onServicesChange(updatedServices);
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => {
      const servicePrice = service.price || 0;
      return total + (servicePrice * service.quantity);
    }, 0);
  };

  const calculateTotalTime = () => {
    return selectedServices.reduce((total, service) => {
      const serviceTime = service.estimatedTime || 0;
      return total + (serviceTime * service.quantity);
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Services</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedServices.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
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
                    <TableCell className="text-right">
                      ${service.price?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      {service.estimatedTime || 0} min
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => handleQuantityChange(service.id, service.quantity - 1)}
                        >-</Button>
                        <span className="mx-2 w-8 text-center">{service.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => handleQuantityChange(service.id, service.quantity + 1)}
                        >+</Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${((service.price || 0) * service.quantity).toFixed(2)}
                    </TableCell>
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
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="font-bold text-right">
                    Total:
                  </TableCell>
                  <TableCell className="text-right">
                    {calculateTotalTime()} min
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-bold text-right">
                    ${calculateTotalPrice().toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
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
