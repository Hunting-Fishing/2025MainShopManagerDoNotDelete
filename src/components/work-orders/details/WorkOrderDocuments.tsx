
import React from 'react';

export interface WorkOrderDocumentsProps {
  workOrderId: string;
}

export const WorkOrderDocuments: React.FC<WorkOrderDocumentsProps> = ({ workOrderId }) => {
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Documents</h3>
      <p className="text-muted-foreground">No documents found for this work order.</p>
    </div>
  );
};
