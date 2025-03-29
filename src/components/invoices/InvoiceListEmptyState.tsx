
import { FileText } from "lucide-react";

export function InvoiceListEmptyState() {
  return (
    <tr>
      <td colSpan={9} className="px-6 py-4 text-center text-sm text-slate-500">
        <div className="flex flex-col items-center justify-center py-6">
          <FileText className="h-12 w-12 text-slate-300" />
          <p className="mt-2 text-slate-500">No invoices found</p>
        </div>
      </td>
    </tr>
  );
}
