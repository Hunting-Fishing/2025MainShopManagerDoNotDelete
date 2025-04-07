
import React from 'react';
import { Customer, CustomerVehicle } from '@/types/customer';
import { Car, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface CustomerVehiclesTabProps {
  customer: Customer;
}

export const CustomerVehiclesTab: React.FC<CustomerVehiclesTabProps> = ({ customer }) => {
  const vehicles = customer.vehicles || [];

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Car className="w-16 h-16 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Vehicles Found</h3>
        <p className="text-muted-foreground mb-6">This customer doesn't have any vehicles registered yet.</p>
        <Button>
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
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
              <TableRow key={vehicle.id || index} className="hover:bg-muted/50 cursor-pointer">
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.make}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
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
