
export { InvoiceServicesSection } from './InvoiceServicesSection';

// Placeholder exports for missing components
export const InvoiceHeader = ({ workOrderId }: { workOrderId: string }) => (
  <div className="text-center mb-6">
    <h1 className="text-2xl font-bold">Work Order Invoice</h1>
    <p className="text-gray-600">#{workOrderId.slice(0, 8)}</p>
  </div>
);

export const InvoiceCustomerInfo = ({ workOrder }: { workOrder: any }) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">Customer Information</h3>
    <p>{workOrder.customer_name || 'N/A'}</p>
    <p>{workOrder.customer_email || 'N/A'}</p>
    <p>{workOrder.customer_phone || 'N/A'}</p>
  </div>
);

export const InvoiceVehicleInfo = ({ vehicle }: { vehicle?: any }) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">Vehicle Information</h3>
    <p>{vehicle?.year || 'N/A'} {vehicle?.make || 'N/A'} {vehicle?.model || 'N/A'}</p>
    <p>License: {vehicle?.license_plate || 'N/A'}</p>
    <p>VIN: {vehicle?.vin || 'N/A'}</p>
  </div>
);

export const InvoiceTotalsSection = ({ workOrder }: { workOrder: any }) => (
  <div className="p-6 bg-gray-50">
    <div className="text-right">
      <div className="text-xl font-bold">
        Total: ${workOrder.total_cost || '0.00'}
      </div>
    </div>
  </div>
);

export const InvoiceFooter = () => (
  <div className="p-6 text-center text-sm text-gray-600">
    <p>Thank you for your business!</p>
  </div>
);
