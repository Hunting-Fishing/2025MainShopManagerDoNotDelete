
import React from 'react';
import { useParams } from 'react-router-dom';

const WorkOrderEdit = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Work Order</h1>
      <p>Work Order ID: {id}</p>
      <p className="text-gray-500">This is a placeholder for the work order edit page.</p>
    </div>
  );
};

export default WorkOrderEdit;
