
import React from 'react';
import { CustomerVehicle } from '@/types/customer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VehicleDetailHeaderProps {
  vehicle: CustomerVehicle;
  customerName: string;
  customerId: string;
}

export const VehicleDetailHeader: React.FC<VehicleDetailHeaderProps> = ({ 
  vehicle, 
  customerName,
  customerId
}) => {
  const navigate = useNavigate();
  
  const handleEditVehicle = () => {
    navigate(`/customers/${customerId}/edit?tab=vehicles`);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-3 rounded-full">
            <Car className="h-8 w-8 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-gray-500">
              {vehicle.license_plate ? `License: ${vehicle.license_plate}` : null}
              {vehicle.vin ? ` • VIN: ${vehicle.vin}` : null}
              {vehicle.color ? ` • Color: ${vehicle.color}` : null}
            </p>
            <p className="text-sm text-gray-400">Owner: {customerName}</p>
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={handleEditVehicle}>
            <Pencil className="h-4 w-4 mr-2" /> Edit Vehicle
          </Button>
        </div>
      </div>
    </Card>
  );
};
