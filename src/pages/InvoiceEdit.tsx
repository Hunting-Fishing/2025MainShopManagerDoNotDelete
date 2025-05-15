
import React from 'react';
import { useParams } from 'react-router-dom';

const InvoiceEdit = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Invoice</h1>
      <p>Invoice ID: {id}</p>
      <p className="text-gray-500">This is a placeholder for the invoice edit page.</p>
    </div>
  );
};

export default InvoiceEdit;
