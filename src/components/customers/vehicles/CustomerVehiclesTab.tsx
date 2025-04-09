
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, CustomerVehicle } from '@/types/customer';
import { Car, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface CustomerVehiclesTabProps {
  customer: Customer;
}

export const CustomerVehiclesTab: React.FC<CustomerVehiclesTabProps> = ({ customer }) => {
  const navigate = useNavigate();
  const vehicles = customer.vehicles || [];
  
  console.log('Rendering CustomerVehiclesTab with vehicles:', vehicles);

  const handleAddVehicle = () => {
    // Use the correct route pattern for edit customer with vehicles tab active
    navigate(`/customers/${customer.id}/edit?tab=vehicles`);
  };

  const handleEditCustomer = () => {
    navigate(`/customers/${customer.id}/edit?tab=vehicles`);
  };

  const handleVehicleClick = (vehicleId: string) => {
    if (!vehicleId) {
      console.error("Cannot navigate to vehicle details: missing vehicle ID");
      return;
    }
    
    if (!customer.id) {
      console.error("Cannot navigate to vehicle details: missing customer ID");
      return;
    }
    
    navigate(`/customers/${customer.id}/vehicles/${vehicleId}`);
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Car className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Vehicles Found</h3>
        <p className="text-muted-foreground mb-6">This customer doesn't have any vehicles registered yet.</p>
        <Button onClick={handleAddVehicle}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Customer Vehicles</h3>
        <div className="flex gap-2">
          <Button onClick={handleAddVehicle}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
          <Button variant="outline" onClick={handleEditCustomer}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Vehicles
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Last Service</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle, index) => (
              <TableRow 
                key={vehicle.id || index} 
                className="hover:bg-muted/50 cursor-pointer" 
                onClick={() => vehicle.id && handleVehicleClick(vehicle.id)}
              >
                <TableCell>{vehicle.year || 'N/A'}</TableCell>
                <TableCell>{vehicle.make || 'N/A'}</TableCell>
                <TableCell>{vehicle.model || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs">
                  {vehicle.vin || <span className="text-muted-foreground">No VIN</span>}
                </TableCell>
                <TableCell>
                  {vehicle.license_plate ? (
                    <Badge variant="outline" className="font-mono">
                      {vehicle.license_plate}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  {vehicle.last_service_date ? (
                    new Date(vehicle.last_service_date).toLocaleDateString()
                  ) : (
                    <span className="text-muted-foreground">No service history</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
