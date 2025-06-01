
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, DollarSign, Edit2, Save, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditableJobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  shopId?: string;
}

export function EditableJobLineCard({ jobLine, onUpdate, onDelete, shopId }: EditableJobLineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJobLine, setEditedJobLine] = useState<WorkOrderJobLine>(jobLine);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success' as const;
      case 'in-progress':
        return 'info' as const;
      case 'on-hold':
        return 'warning' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'outline' as const;
    
    switch (category.toLowerCase()) {
      case 'remove & replace':
      case 'replacement':
        return 'destructive' as const;
      case 'repair':
      case 'service':
        return 'info' as const;
      case 'maintenance':
        return 'warning' as const;
      case 'inspection':
      case 'testing':
        return 'secondary' as const;
      case 'parts':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleSave = () => {
    // Calculate total amount if hours and rate are provided
    const totalAmount = editedJobLine.estimatedHours && editedJobLine.laborRate 
      ? editedJobLine.estimatedHours * editedJobLine.laborRate 
      : editedJobLine.totalAmount || 0;

    const updatedJobLine = {
      ...editedJobLine,
      totalAmount,
      updatedAt: new Date().toISOString()
    };

    onUpdate(updatedJobLine);
    setIsEditing(false);
    toast.success('Job line updated successfully');
  };

  const handleCancel = () => {
    setEditedJobLine(jobLine);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job line?')) {
      onDelete(jobLine.id);
      toast.success('Job line deleted successfully');
    }
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <Input
                value={editedJobLine.name}
                onChange={(e) => setEditedJobLine({ ...editedJobLine, name: e.target.value })}
                placeholder="Job line name"
                className="font-semibold"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={editedJobLine.category || ''}
                  onChange={(e) => setEditedJobLine({ ...editedJobLine, category: e.target.value })}
                  placeholder="Category"
                />
                <Input
                  value={editedJobLine.subcategory || ''}
                  onChange={(e) => setEditedJobLine({ ...editedJobLine, subcategory: e.target.value })}
                  placeholder="Subcategory"
                />
              </div>

              <Textarea
                value={editedJobLine.description || ''}
                onChange={(e) => setEditedJobLine({ ...editedJobLine, description: e.target.value })}
                placeholder="Description"
                className="min-h-[60px]"
              />

              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="0.25"
                  value={editedJobLine.estimatedHours || ''}
                  onChange={(e) => setEditedJobLine({ ...editedJobLine, estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Hours"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={editedJobLine.laborRate || ''}
                  onChange={(e) => setEditedJobLine({ ...editedJobLine, laborRate: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Rate ($)"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={editedJobLine.totalAmount || ''}
                  onChange={(e) => setEditedJobLine({ ...editedJobLine, totalAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Total ($)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {jobLine.name}
            </h3>
            {jobLine.category && (
              <Badge variant={getCategoryColor(jobLine.category)} className="text-xs mb-2">
                {jobLine.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Badge variant={getStatusColor(jobLine.status)} className="text-xs">
              {jobLine.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {jobLine.description && jobLine.description !== jobLine.name && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {jobLine.description}
          </p>
        )}

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
            {jobLine.estimatedHours && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{jobLine.estimatedHours}h</span>
              </div>
            )}
          </div>
          
          {jobLine.totalAmount && (
            <div className="flex items-center gap-1 font-semibold text-lg">
              <DollarSign className="h-4 w-4" />
              <span>${jobLine.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {jobLine.laborRate && (
          <div className="mb-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-muted-foreground">
              Labor Rate: ${jobLine.laborRate}/hr
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
