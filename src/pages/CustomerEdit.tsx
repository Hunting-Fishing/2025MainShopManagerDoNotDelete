
import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerEdit = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Customer</h1>
      <p>Customer ID: {id}</p>
      <p className="text-gray-500">This is a placeholder for the customer edit page.</p>
    </div>
  );
};

export default CustomerEdit;
