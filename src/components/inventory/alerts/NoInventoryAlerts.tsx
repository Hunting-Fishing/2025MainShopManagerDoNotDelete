
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const NoInventoryAlerts: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed text-center">
      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-800 mb-2">No Inventory Alerts</h3>
      <p className="text-gray-600 max-w-md">
        All inventory items are at healthy stock levels. There are no low stock or out of stock items to report.
      </p>
    </div>
  );
};

export default NoInventoryAlerts;
