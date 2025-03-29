
import { Link } from "react-router-dom";
import { InventoryItemExtended } from "@/types/inventory";

// Status map for styling
const statusMap = {
  "In Stock": { color: "bg-green-100 text-green-800" },
  "Low Stock": { color: "bg-yellow-100 text-yellow-800" },
  "Out of Stock": { color: "bg-red-100 text-red-800" },
};

interface InventoryTableProps {
  items: InventoryItemExtended[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Item Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              SKU
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Unit Price
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Supplier
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                {item.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {item.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {item.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {item.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[item.status as keyof typeof statusMap].color}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                ${item.unitPrice.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {item.supplier}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/inventory/${item.id}`} className="text-esm-blue-600 hover:text-esm-blue-800 mr-4">
                  View
                </Link>
                <Link to={`/inventory/${item.id}/edit`} className="text-esm-blue-600 hover:text-esm-blue-800">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
