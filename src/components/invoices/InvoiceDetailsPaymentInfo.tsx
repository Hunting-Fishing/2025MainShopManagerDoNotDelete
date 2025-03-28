
interface InvoiceDetailsPaymentInfoProps {
  paymentMethod: string;
  status: string;
  statusLabel: string;
  createdBy: string;
}

export function InvoiceDetailsPaymentInfo({
  paymentMethod,
  status,
  statusLabel,
  createdBy,
}: InvoiceDetailsPaymentInfoProps) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Payment Information:</h3>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Payment Method: {paymentMethod || "N/A"}</p>
          <p className="text-sm text-slate-500">Payment Status: {statusLabel}</p>
        </div>
        <div className="text-sm text-slate-500">
          <p>Created By: {createdBy}</p>
        </div>
      </div>
    </div>
  );
}
