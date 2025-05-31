
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Clock, DollarSign, Edit2, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditableJobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  shopId?: string;
}

const JOB_LINE_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' }
];

export function EditableJobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  shopId
}: EditableJobLineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: jobLine.name,
    estimatedHours: jobLine.estimatedHours || 0,
    laborRate: jobLine.laborRate || 0,
    status: jobLine.status
  });

  const handleSave = () => {
    if (!editData.name.trim()) {
      toast.error('Job line name is required');
      return;
    }

    const totalAmount = editData.estimatedHours * editData.laborRate;

    const updatedJobLine: WorkOrderJobLine = {
      ...jobLine,
      name: editData.name,
      estimatedHours: editData.estimatedHours,
      laborRate: editData.laborRate,
      totalAmount,
      status: editData.status,
      updatedAt: new Date().toISOString()
    };

    onUpdate(updatedJobLine);
    setIsEditing(false);
    toast.success('Job line updated successfully');
  };

  const handleCancel = () => {
    setEditData({
      name: jobLine.name,
      estimatedHours: jobLine.estimatedHours || 0,
      laborRate: jobLine.laborRate || 0,
      status: jobLine.status
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'on-hold': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="font-semibold text-base mb-2"
              />
            ) : (
              <h3 className="font-semibold text-base leading-tight mb-1">
                {jobLine.name}
              </h3>
            )}
            
            {jobLine.category && (
              <Badge variant="outline" className="text-xs mb-2">
                {jobLine.category}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {isEditing ? (
              <Select value={editData.status} onValueChange={(value: WorkOrderJobLine['status']) => setEditData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_LINE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={getStatusColor(jobLine.status)} className="text-xs">
                {jobLine.status.replace('-', ' ')}
              </Badge>
            )}
          </div>
        </div>

        {jobLine.description && jobLine.description !== jobLine.name && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {jobLine.description}
          </p>
        )}

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  value={editData.estimatedHours}
                  onChange={(e) => setEditData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  className="w-20"
                />
                <span className="text-sm">h</span>
              </div>
            ) : (
              jobLine.estimatedHours && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{jobLine.estimatedHours}h</span>
                </div>
              )
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editData.laborRate}
                onChange={(e) => setEditData(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
                className="w-24"
              />
              <span className="text-sm">/hr</span>
            </div>
          ) : (
            jobLine.totalAmount && (
              <div className="flex items-center gap-1 font-semibold text-lg">
                <DollarSign className="h-4 w-4" />
                <span>${jobLine.totalAmount.toFixed(2)}</span>
              </div>
            )
          )}
        </div>

        {isEditing && (
          <div className="mb-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-muted-foreground">
              Total: ${(editData.estimatedHours * editData.laborRate).toFixed(2)}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {jobLine.laborRate && !isEditing && (
            <div className="text-xs text-muted-foreground">
              Labor Rate: ${jobLine.laborRate}/hr
            </div>
          )}
          
          <div className="flex items-center gap-1 ml-auto">
            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(jobLine.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
