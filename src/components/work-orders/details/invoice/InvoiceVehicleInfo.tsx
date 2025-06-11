
import React from 'react';

interface Vehicle {
  id: string;
  year?: number | string;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  trim?: string;
}

interface InvoiceVehicleInfoProps {
  vehicle?: Vehicle;
}

export function InvoiceVehicleInfo({ vehicle }: InvoiceVehicleInfoProps) {
  if (!vehicle) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Vehicle Information:</h3>
        <p className="text-gray-500">No vehicle information available</p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-2">Vehicle Information:</h3>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <span className="font-medium">Vehicle:</span>
          <span className="ml-2">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim && ` ${vehicle.trim}`}
          </span>
        </div>
        {vehicle.vin && (
          <div>
            <span className="font-medium">VIN:</span>
            <span className="ml-2">{vehicle.vin}</span>
          </div>
        )}
        {vehicle.license_plate && (
          <div>
            <span className="font-medium">License Plate:</span>
            <span className="ml-2">{vehicle.license_plate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
