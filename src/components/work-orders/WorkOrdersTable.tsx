
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Eye, Clock, Calendar, User, GripVertical } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  WorkOrder, 
  priorityMap, 
  statusMap 
} from "@/types/workOrder";
import { 
  getWorkOrderCustomer,
  getWorkOrderTechnician,
  getWorkOrderDate,
  getWorkOrderDueDate,
  getWorkOrderPriority,
  getWorkOrderLocation,
  getWorkOrderTotalBillableTime
} from "@/utils/workOrderUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

interface Column {
  id: string;
  label: string;
  width?: string;
}

const defaultColumns: Column[] = [
  { id: 'vehicle', label: 'Vehicle', width: 'w-[180px]' },
  { id: 'description', label: 'Description' },
  { id: 'customer', label: 'Customer' },
  { id: 'status', label: 'Status' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'priority', label: 'Priority' },
  { id: 'actions', label: 'Actions', width: 'text-right' },
];

function SortableTableHead({ column, children }: { column: Column; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead 
      ref={setNodeRef} 
      style={style} 
      className={`${column.width || ''} relative group`}
      {...attributes}
    >
      <div className="flex items-center gap-2">
        <div 
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {children}
      </div>
    </TableHead>
  );
}

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // Function to get status badge styles
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'pending':
        return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'in-progress':
        return 'text-blue-800 bg-blue-100 border-blue-200'; 
      case 'completed':
        return 'text-green-800 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-800 bg-red-100 border-red-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  // Function to format vehicle information
  const getVehicleInfo = (order: WorkOrder) => {
    const year = order.vehicle_year;
    const make = order.vehicle_make;
    const model = order.vehicle_model;
    const licensePlate = order.vehicle_license_plate;
    
    if (year && make && model) {
      return `${year} ${make} ${model}`;
    } else if (make && model) {
      return `${make} ${model}`;
    } else if (licensePlate) {
      return `License: ${licensePlate}`;
    }
    return 'No Vehicle Info';
  };

  // Function to render cell content based on column
  const renderCellContent = (order: WorkOrder, columnId: string, index: number) => {
    switch (columnId) {
      case 'vehicle':
        return (
          <div>
            <Link 
              to={`/work-orders/${order.id}`}
              className="font-medium text-blue-600 hover:underline block"
            >
              {getVehicleInfo(order)}
            </Link>
            {order.vehicle_license_plate && getVehicleInfo(order) !== `License: ${order.vehicle_license_plate}` && (
              <div className="text-xs text-muted-foreground mt-1">
                {order.vehicle_license_plate}
              </div>
            )}
          </div>
        );
      
      case 'description':
        return (
          <div>
            {order.description}
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {getWorkOrderLocation(order) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> 
                  {format(new Date(getWorkOrderDate(order) || order.created_at || new Date()), "MMM d, yyyy")}
                </span>
              )}
              {getWorkOrderTechnician(order) && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> 
                  {getWorkOrderTechnician(order)}
                </span>
              )}
              {getWorkOrderTotalBillableTime(order) > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 
                  {Math.floor(getWorkOrderTotalBillableTime(order) / 60)}h {getWorkOrderTotalBillableTime(order) % 60}m
                </span>
              )}
            </div>
          </div>
        );
      
      case 'customer':
        return getWorkOrderCustomer(order);
      
      case 'status':
        return (
          <Badge 
            variant="outline" 
            className={`rounded-full border px-2 py-1 font-medium ${getStatusStyles(order.status)}`}
          >
            {statusMap[order.status] || order.status}
          </Badge>
        );
      
      case 'dueDate':
        return getWorkOrderDueDate(order) ? 
          format(new Date(getWorkOrderDueDate(order)), "MMM d, yyyy") : 
          "—";
      
      case 'priority':
        return (
          <Badge 
            variant="outline" 
            className={`rounded-full border text-xs ${priorityMap[getWorkOrderPriority(order)]?.classes || ""}`}
          >
            {getWorkOrderPriority(order)}
          </Badge>
        );
      
      case 'actions':
        return (
          <Button 
            variant="ghost" 
            size="sm"
            className="rounded-full hover:bg-blue-50 hover:text-blue-600"
            asChild
          >
            <Link to={`/work-orders/${order.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
        );
      
      default:
        return null;
    }
  };

  // If no work orders, show empty state
  if (workOrders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-white dark:bg-slate-900">
        <h3 className="text-lg font-medium">No work orders found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your filters or create a new work order
        </p>
        <Button className="mt-4">
          <Link to="/work-orders/create">Create Work Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
                {columns.map((column) => (
                  <SortableTableHead key={column.id} column={column}>
                    {column.label}
                  </SortableTableHead>
                ))}
              </SortableContext>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((order, index) => (
              <TableRow 
                key={order.id}
                colorIndex={index}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.id} 
                    className={column.id === 'actions' ? 'text-right' : ''}
                  >
                    {renderCellContent(order, column.id, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
