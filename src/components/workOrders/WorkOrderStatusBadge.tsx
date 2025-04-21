
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface WorkOrderStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default' | 'lg';
}

export function WorkOrderStatusBadge({ status, size = 'default' }: WorkOrderStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        };
      case 'in-progress':
      case 'in_progress':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          label: 'In Progress'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: AlertCircle,
          label: status || 'Unknown'
        };
    }
  };

  const { color, icon: Icon, label } = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'px-2.5 py-0.5 text-sm';

  return (
    <Badge className={`${color} gap-1 font-medium border ${sizeClasses}`} variant="outline">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
