
import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerVehicleDetails = () => {
  const { id, vehicleId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vehicle Details</h1>
      <p>Customer ID: {id}</p>
      <p>Vehicle ID: {vehicleId}</p>
      <p className="text-gray-500">This is a placeholder for the vehicle details page.</p>
    </div>
  );
};

export default CustomerVehicleDetails;
