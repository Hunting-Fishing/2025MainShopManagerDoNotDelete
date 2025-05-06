
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { PlusCircle, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Status map for styling
const statusMap = {
  "In Stock": { color: "bg-green-100 text-green-800 border border-green-300" },
  "Low Stock": { color: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  "Out of Stock": { color: "bg-red-100 text-red-800 border border-red-300" },
};

// Column definition type
interface ColumnDef {
  id: string;
  header: string;
  accessor: (item: InventoryItemExtended) => React.ReactNode;
  className?: string;
  width?: string;
  show: boolean;
}

interface InventoryTableProps {
  items: InventoryItemExtended[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  // Calculate quantity available (quantity - reserved)
  const getQuantityAvailable = (item: InventoryItemExtended) => {
    const reserved = item.onHold || 0;
    return item.quantity - reserved;
  };

  // Calculate markup percentage
  const calculateMarkup = (cost: number | undefined, price: number) => {
    if (!cost || cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

  // Format date strings to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Define columns with their render functions
  const allColumns: ColumnDef[] = [
    {
      id: "partNumber",
      header: "Part #",
      accessor: (item) => item.partNumber || item.id.substring(0, 8),
      className: "font-medium text-slate-700",
      width: "w-[80px]",
      show: true
    },
    {
      id: "name",
      header: "Item Name",
      accessor: (item) => item.name,
      className: "font-medium",
      show: true
    },
    {
      id: "sku",
      header: "SKU",
      accessor: (item) => item.sku,
      show: true
    },
    {
      id: "barcode",
      header: "Barcode",
      accessor: (item) => item.barcode || "N/A",
      show: true
    },
    {
      id: "category",
      header: "Category",
      accessor: (item) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-300">
          {item.category}
        </span>
      ),
      show: true
    },
    {
      id: "subcategory",
      header: "Subcategory",
      accessor: (item) => item.subcategory || "N/A",
      show: false
    },
    {
      id: "manufacturer",
      header: "Brand / Manufacturer",
      accessor: (item) => item.manufacturer || "N/A",
      show: true
    },
    {
      id: "vehicleCompatibility",
      header: "Vehicle Compatibility",
      accessor: (item) => item.vehicleCompatibility || "N/A",
      show: false
    },
    {
      id: "location",
      header: "Location",
      accessor: (item) => item.location || "N/A",
      show: true
    },
    {
      id: "quantity",
      header: "Qty In Stock",
      accessor: (item) => item.quantity,
      show: true
    },
    {
      id: "onHold",
      header: "Qty Reserved",
      accessor: (item) => item.onHold || 0,
      show: true
    },
    {
      id: "available",
      header: "Qty Available",
      accessor: (item) => getQuantityAvailable(item),
      show: true
    },
    {
      id: "onOrder",
      header: "Qty on Order",
      accessor: (item) => item.onOrder || 0,
      show: true
    },
    {
      id: "reorderPoint",
      header: "Reorder Level",
      accessor: (item) => item.reorderPoint,
      show: true
    },
    {
      id: "cost",
      header: "Unit Cost",
      accessor: (item) => `$${item.cost?.toFixed(2) || "N/A"}`,
      show: true
    },
    {
      id: "unitPrice",
      header: "Unit Price",
      accessor: (item) => `$${item.unitPrice.toFixed(2)}`,
      show: true
    },
    {
      id: "markup",
      header: "Markup %",
      accessor: (item) => `${item.marginMarkup || calculateMarkup(item.cost, item.unitPrice).toFixed(2)}%`,
      show: true
    },
    {
      id: "totalValue",
      header: "Total Value",
      accessor: (item) => `$${(item.quantity * item.unitPrice).toFixed(2)}`,
      show: true
    },
    {
      id: "warrantyPeriod",
      header: "Warranty Period",
      accessor: (item) => item.warrantyPeriod || "N/A",
      show: false
    },
    {
      id: "status",
      header: "Status",
      accessor: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[item.status as keyof typeof statusMap]?.color || "bg-gray-100 text-gray-800"}`}>
          {item.status}
        </span>
      ),
      show: true
    },
    {
      id: "supplier",
      header: "Supplier",
      accessor: (item) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
          {item.supplier}
        </span>
      ),
      show: true
    },
    {
      id: "dateBought",
      header: "Last Ordered",
      accessor: (item) => formatDate(item.dateBought),
      show: true
    },
    {
      id: "dateLast",
      header: "Last Used",
      accessor: (item) => formatDate(item.dateLast),
      show: true
    },
    {
      id: "notes",
      header: "Notes",
      accessor: (item) => item.notes || "N/A",
      show: false
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (item) => (
        <div className="text-right">
          <Link to={`/inventory/${item.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
            View
          </Link>
          <Link to={`/inventory/${item.id}/edit`} className="text-blue-600 hover:text-blue-800">
            Edit
          </Link>
        </div>
      ),
      className: "text-right",
      show: true
    }
  ];

  // State for column ordering
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  
  // Initialize columns from allColumns, filtered by 'show' property
  useEffect(() => {
    setColumns(allColumns.filter(col => col.show));
  }, []);

  // Handle column reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setColumns(items);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <Table>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns" direction="horizontal">
            {(provided) => (
              <TableHeader 
                className="bg-slate-50"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <TableRow>
                  {columns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided) => (
                        <TableHead 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`font-medium ${column.width || ""} ${column.className || ""}`}
                        >
                          <div className="flex items-center">
                            <span {...provided.dragHandleProps} className="mr-2 cursor-move">
                              <GripHorizontal size={14} />
                            </span>
                            {column.header}
                          </div>
                        </TableHead>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableRow>
              </TableHeader>
            )}
          </Droppable>
        </DragDropContext>
        
        <TableBody>
          {items.length > 0 ? (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <TableCell key={`${item.id}-${column.id}`} className={column.className || ""}>
                    {column.accessor(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-[200px] text-center">
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="text-lg font-medium text-slate-700">No inventory items found</div>
                  <p className="text-slate-500 max-w-md text-center">
                    Get started by adding your first inventory item to keep track of your stock.
                  </p>
                  <Button asChild className="mt-4 rounded-full bg-blue-600 hover:bg-blue-700">
                    <Link to="/inventory/add">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Item
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
