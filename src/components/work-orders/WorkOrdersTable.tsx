
import React, { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/dateUtils';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

interface Column {
  id: string;
  label: string;
  accessor: keyof WorkOrder | 'actions';
}

const defaultColumns: Column[] = [
  { id: 'vehicle', label: 'Vehicle', accessor: 'vehicle_id' },
  { id: 'customer', label: 'Customer', accessor: 'customer_id' },
  { id: 'status', label: 'Status', accessor: 'status' },
  { id: 'description', label: 'Description', accessor: 'description' },
  { id: 'created_at', label: 'Created', accessor: 'created_at' },
  { id: 'actions', label: 'Actions', accessor: 'actions' },
];

function SortableTableHeader({ column }: { column: Column }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead 
      ref={setNodeRef} 
      style={style} 
      className="cursor-move select-none"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        {column.label}
      </div>
    </TableHead>
  );
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'default';
    case 'in-progress':
      return 'secondary';
    case 'pending':
      return 'outline';
    default:
      return 'outline';
  }
};

const getVehicleInfo = (workOrder: WorkOrder): string => {
  const year = workOrder.vehicle_year || '';
  const make = workOrder.vehicle_make || '';
  const model = workOrder.vehicle_model || '';
  
  if (year || make || model) {
    return `${year} ${make} ${model}`.trim();
  }
  
  return 'No vehicle assigned';
};

const renderCellContent = (workOrder: WorkOrder, column: Column) => {
  switch (column.id) {
    case 'vehicle':
      return getVehicleInfo(workOrder);
    case 'customer':
      return workOrder.customer_name || workOrder.customer || 'No customer';
    case 'status':
      return (
        <Badge variant={getStatusVariant(workOrder.status)}>
          {workOrder.status}
        </Badge>
      );
    case 'description':
      return workOrder.description ? (
        <span className="truncate max-w-xs block" title={workOrder.description}>
          {workOrder.description}
        </span>
      ) : '—';
    case 'created_at':
      return workOrder.created_at ? formatDate(workOrder.created_at) : '—';
    case 'actions':
      return (
        <Button variant="outline" size="sm" asChild>
          <Link to={`/work-orders/${workOrder.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      );
    default:
      const value = workOrder[column.accessor as keyof WorkOrder];
      return value ? String(value) : '—';
  }
};

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (workOrders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No work orders found</p>
          <Button asChild>
            <Link to="/work-orders/new">Create Work Order</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
                    {columns.map((column) => (
                      <SortableTableHeader key={column.id} column={column} />
                    ))}
                  </SortableContext>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    {columns.map((column) => (
                      <TableCell key={`${workOrder.id}-${column.id}`}>
                        {renderCellContent(workOrder, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DndContext>
      </CardContent>
    </Card>
  );
}
