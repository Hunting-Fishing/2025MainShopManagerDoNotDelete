
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkOrder } from '@/types/workOrder';
import { formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableProvider,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

interface Column {
  id: string;
  label: string;
  accessor: keyof WorkOrder | ((workOrder: WorkOrder) => string);
  sortable?: boolean;
}

const SortableTableHeader: React.FC<{
  column: Column;
  children: React.ReactNode;
}> = ({ column, children }) => {
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
      className="relative group cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
        {children}
      </div>
    </TableHead>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'on-hold':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  const navigate = useNavigate();

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'customer',
      label: 'Customer',
      accessor: (workOrder) => workOrder.customer_name || workOrder.customer || 'No Customer',
      sortable: true,
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      accessor: (workOrder) => {
        if (workOrder.vehicle_make && workOrder.vehicle_model) {
          return `${workOrder.vehicle_year || ''} ${workOrder.vehicle_make} ${workOrder.vehicle_model}`.trim();
        }
        return 'No Vehicle';
      },
      sortable: true,
    },
    {
      id: 'description',
      label: 'Description',
      accessor: (workOrder) => workOrder.description || 'No Description',
      sortable: true,
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
    },
    {
      id: 'technician',
      label: 'Technician',
      accessor: (workOrder) => workOrder.technician || 'Unassigned',
      sortable: true,
    },
    {
      id: 'date',
      label: 'Created',
      accessor: (workOrder) => formatDate(workOrder.created_at),
      sortable: true,
    },
    {
      id: 'total_cost',
      label: 'Total',
      accessor: (workOrder) => formatCurrency(workOrder.total_cost),
      sortable: true,
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRowClick = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.id}`);
  };

  const getCellValue = (workOrder: WorkOrder, column: Column): string => {
    if (typeof column.accessor === 'function') {
      return column.accessor(workOrder);
    }
    const value = workOrder[column.accessor];
    return value?.toString() || '';
  };

  if (workOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No work orders found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <SortableContext
                items={columns.map((col) => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <SortableTableHeader key={column.id} column={column}>
                    {column.label}
                  </SortableTableHeader>
                ))}
              </SortableContext>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow
                key={workOrder.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(workOrder)}
              >
                {columns.map((column) => (
                  <TableCell key={`${workOrder.id}-${column.id}`}>
                    {column.id === 'status' ? (
                      <Badge className={getStatusColor(getCellValue(workOrder, column))}>
                        {getCellValue(workOrder, column)}
                      </Badge>
                    ) : (
                      <div className="max-w-[200px] truncate" title={getCellValue(workOrder, column)}>
                        {getCellValue(workOrder, column)}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/work-orders/${workOrder.id}`);
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/work-orders/${workOrder.id}/edit`);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
