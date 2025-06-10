
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
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-2">Vehicle Information</h3>
      <div className="grid grid-cols-4 gap-4 text-sm">
        <VehicleField label="Year" value={vehicle.year} />
        <VehicleField label="Make" value={vehicle.make} />
        <VehicleField label="Model" value={vehicle.model} />
        <VehicleField label="VIN" value={vehicle.vin} />
      </div>
    </div>
  );
}

interface VehicleFieldProps {
  label: string;
  value?: string | number;
}

function VehicleField({ label, value }: VehicleFieldProps) {
  return (
    <div>
      <span className="text-gray-600">{label}:</span>
      <span className="ml-2 text-gray-900">{value || 'N/A'}</span>
    </div>
  );
}
