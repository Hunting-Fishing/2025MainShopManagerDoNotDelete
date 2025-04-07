
import React from 'react';
import { FileText } from 'lucide-react';

export const VehicleInspections: React.FC<{ vehicleId: string }> = ({ vehicleId }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FileText className="w-16 h-16 mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">No Inspections Found</h3>
      <p className="text-muted-foreground">
        There are no digital inspections recorded for this vehicle.
      </p>
    </div>
  );
};
