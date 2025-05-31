
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Clock, DollarSign, Edit2, Save, X, Trash2 } from 'lucide-react';
import { useLaborRates } from '@/hooks/useLaborRates';

interface EditableJobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  shopId?: string;
}

export function EditableJobLineCard({ 
  jobLine, 
  onUpdate, 
  onDelete,
  shopId 
}: EditableJobLineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJobLine, setEditedJobLine] = useState(jobLine);
  const { laborRates, getDefaultRate } = useLaborRates(shopId);

  const handleSave = () => {
    // Recalculate total amount
    const totalAmount = (editedJobLine.estimatedHours || 0) * (editedJobLine.laborRate || 0);
    const updatedJobLine = {
      ...editedJobLine,
      totalAmount,
      updatedAt: new Date().toISOString()
    };
    
    onUpdate(updatedJobLine);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedJobLine(jobLine);
    setIsEditing(false);
  };

  const handleLaborRateChange = (rateType: string) => {
    const selectedRate = laborRates.find(rate => rate.rate_type === rateType);
    if (selectedRate) {
      setEditedJobLine(prev => ({
        ...prev,
        laborRate: selectedRate.hourly_rate
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'on-hold':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'outline';
    
    switch (category.toLowerCase()) {
      case 'remove & replace':
      case 'replacement':
        return 'destructive';
      case 'repair':
      case 'service':
        return 'info';
      case 'maintenance':
        return 'warning';
      case 'inspection':
      case 'testing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base">Edit Job Line</h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="h-8">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Service Name</Label>
              <Input
                id="name"
                value={editedJobLine.name}
                onChange={(e) => setEditedJobLine(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Input
                  id="category"
                  value={editedJobLine.category || ''}
                  onChange={(e) => setEditedJobLine(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subcategory" className="text-sm font-medium">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={editedJobLine.subcategory || ''}
                  onChange={(e) => setEditedJobLine(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={editedJobLine.description || ''}
                onChange={(e) => setEditedJobLine(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="hours" className="text-sm font-medium">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.1"
                  min="0"
                  value={editedJobLine.estimatedHours || 0}
                  onChange={(e) => setEditedJobLine(prev => ({ 
                    ...prev, 
                    estimatedHours: parseFloat(e.target.value) || 0 
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="laborRate" className="text-sm font-medium">Labor Rate</Label>
                <Select
                  value={laborRates.find(rate => rate.hourly_rate === editedJobLine.laborRate)?.rate_type || 'standard'}
                  onValueChange={handleLaborRateChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select rate type" />
                  </SelectTrigger>
                  <SelectContent>
                    {laborRates.map((rate) => (
                      <SelectItem key={rate.id} value={rate.rate_type}>
                        {rate.rate_type} - ${rate.hourly_rate}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Total</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-lg font-semibold">
                  ${((editedJobLine.estimatedHours || 0) * (editedJobLine.laborRate || 0)).toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={editedJobLine.status}
                onValueChange={(value: any) => setEditedJobLine(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={getStatusColor(jobLine.status)} className="text-xs">
              {jobLine.status.replace('-', ' ')}
            </Badge>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(jobLine.id)}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {jobLine.description && jobLine.description !== jobLine.name && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {jobLine.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {jobLine.estimatedHours && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{jobLine.estimatedHours}h</span>
              </div>
            )}
            {jobLine.laborRate && (
              <div className="text-xs text-muted-foreground">
                Rate: ${jobLine.laborRate}/hr
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
      </CardContent>
    </Card>
  );
}
