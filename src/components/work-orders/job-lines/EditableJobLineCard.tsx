
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, X, Edit } from 'lucide-react';
import { useLabourRates } from '@/hooks/useLabourRates';

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
  const { rates } = useLabourRates();

  const handleSave = () => {
    // Recalculate total amount based on current values
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

  const handleLaborRateTypeChange = (rateType: string) => {
    let laborRate = rates.standard_rate;
    
    switch (rateType) {
      case 'diagnostic':
        laborRate = rates.diagnostic_rate;
        break;
      case 'emergency':
        laborRate = rates.emergency_rate;
        break;
      case 'warranty':
        laborRate = rates.warranty_rate;
        break;
      case 'internal':
        laborRate = rates.internal_rate;
        break;
      default:
        laborRate = rates.standard_rate;
    }

    const updatedJobLine = {
      ...editedJobLine,
      laborRate: typeof laborRate === 'number' ? laborRate : parseFloat(laborRate.toString()) || 0,
      totalAmount: (editedJobLine.estimatedHours || 0) * (typeof laborRate === 'number' ? laborRate : parseFloat(laborRate.toString()) || 0)
    };
    
    setEditedJobLine(updatedJobLine);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Input
              value={editedJobLine.name}
              onChange={(e) => setEditedJobLine({ ...editedJobLine, name: e.target.value })}
              className="font-semibold text-base"
              placeholder="Job line name"
            />
            <div className="flex gap-2 ml-2">
              <Button onClick={handleSave} size="sm" variant="default">
                <Save className="h-4 w-4" />
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Category</label>
            <Input
              value={editedJobLine.category || ''}
              onChange={(e) => setEditedJobLine({ ...editedJobLine, category: e.target.value })}
              placeholder="Service category"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={editedJobLine.description || ''}
              onChange={(e) => setEditedJobLine({ ...editedJobLine, description: e.target.value })}
              placeholder="Job description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={editedJobLine.estimatedHours || ''}
                onChange={(e) => {
                  const hours = parseFloat(e.target.value) || 0;
                  setEditedJobLine({ 
                    ...editedJobLine, 
                    estimatedHours: hours,
                    totalAmount: hours * (editedJobLine.laborRate || 0)
                  });
                }}
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Labor Rate Type</label>
              <Select onValueChange={handleLaborRateTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (${typeof rates.standard_rate === 'number' ? rates.standard_rate : parseFloat(rates.standard_rate.toString()) || 0}/hr)</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic (${typeof rates.diagnostic_rate === 'number' ? rates.diagnostic_rate : parseFloat(rates.diagnostic_rate.toString()) || 0}/hr)</SelectItem>
                  <SelectItem value="emergency">Emergency (${typeof rates.emergency_rate === 'number' ? rates.emergency_rate : parseFloat(rates.emergency_rate.toString()) || 0}/hr)</SelectItem>
                  <SelectItem value="warranty">Warranty (${typeof rates.warranty_rate === 'number' ? rates.warranty_rate : parseFloat(rates.warranty_rate.toString()) || 0}/hr)</SelectItem>
                  <SelectItem value="internal">Internal (${typeof rates.internal_rate === 'number' ? rates.internal_rate : parseFloat(rates.internal_rate.toString()) || 0}/hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Labor Rate: ${editedJobLine.laborRate || 0}/hr
            </div>
            <div className="font-semibold text-lg">
              Total: ${(editedJobLine.totalAmount || 0).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{jobLine.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(jobLine.status)}>
              {jobLine.status.replace('-', ' ')}
            </Badge>
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="ghost"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDelete(jobLine.id)}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {jobLine.category && (
          <Badge variant="outline" className="mb-2">
            {jobLine.category}
          </Badge>
        )}
        
        {jobLine.description && jobLine.description !== jobLine.name && (
          <p className="text-sm text-muted-foreground mb-3">
            {jobLine.description}
          </p>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {jobLine.estimatedHours}h @ ${jobLine.laborRate}/hr
          </div>
          <div className="font-semibold text-lg">
            ${(jobLine.totalAmount || 0).toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
