
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkOrderJobLine, JobLineFormValues, LaborRateType, JobLineStatus } from '@/types/jobLine';
import { Calculator, Clock, DollarSign, Wrench, FileText } from 'lucide-react';

interface JobLineFormProps {
  jobLine?: WorkOrderJobLine;
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function JobLineForm({
  jobLine,
  workOrderId,
  onSave,
  onCancel,
  isEditing = false
}: JobLineFormProps) {
  const [formData, setFormData] = useState<JobLineFormValues>({
    name: jobLine?.name || '',
    category: jobLine?.category || '',
    subcategory: jobLine?.subcategory || '',
    description: jobLine?.description || '',
    estimated_hours: jobLine?.estimated_hours || 0,
    labor_rate: jobLine?.labor_rate || 0,
    labor_rate_type: (jobLine?.labor_rate_type as LaborRateType) || 'standard',
    total_amount: jobLine?.total_amount || 0,
    status: (jobLine?.status as JobLineStatus) || 'pending',
    display_order: jobLine?.display_order || 1,
    notes: jobLine?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total amount when hours or rate changes
  useEffect(() => {
    const hours = Number(formData.estimated_hours) || 0;
    const rate = Number(formData.labor_rate) || 0;
    const total = hours * rate;
    
    setFormData(prev => ({
      ...prev,
      total_amount: total
    }));
  }, [formData.estimated_hours, formData.labor_rate]);

  const handleInputChange = (field: keyof JobLineFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Job line name is required';
    }

    if (!formData.estimated_hours || formData.estimated_hours <= 0) {
      newErrors.estimated_hours = 'Estimated hours must be greater than 0';
    }

    if (!formData.labor_rate || formData.labor_rate <= 0) {
      newErrors.labor_rate = 'Labor rate must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const savedJobLine: WorkOrderJobLine = {
      id: jobLine?.id || `temp-${Date.now()}`,
      work_order_id: workOrderId,
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      estimated_hours: Number(formData.estimated_hours),
      labor_rate: Number(formData.labor_rate),
      labor_rate_type: formData.labor_rate_type,
      total_amount: Number(formData.total_amount),
      status: formData.status,
      display_order: Number(formData.display_order),
      notes: formData.notes,
      created_at: jobLine?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave([savedJobLine]);
  };

  const laborRateTypes: { value: LaborRateType; label: string }[] = [
    { value: 'standard', label: 'Standard Rate' },
    { value: 'overtime', label: 'Overtime Rate' },
    { value: 'premium', label: 'Premium Rate' },
    { value: 'flat_rate', label: 'Flat Rate' }
  ];

  const jobLineStatuses: { value: JobLineStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wrench className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditing ? 'Edit Job Line' : 'Add Job Line'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing ? 'Update job line details' : 'Create a new job line for this work order'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          Work Order: {workOrderId.slice(-8)}
        </Badge>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Job Line Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter job line name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Service, Repair, Maintenance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subcategory" className="text-sm font-medium">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="e.g., Engine, Brakes, Electrical"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value as JobLineStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobLineStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={`${status.color} text-xs px-2 py-0`}>
                              {status.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of the work to be performed"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or special instructions"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing & Hours */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="h-4 w-4" />
                Labor & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_hours" className="text-sm font-medium">
                  Estimated Hours <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="estimated_hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={formData.estimated_hours}
                    onChange={(e) => handleInputChange('estimated_hours', Number(e.target.value))}
                    placeholder="0.00"
                    className={`pl-10 ${errors.estimated_hours ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.estimated_hours && <p className="text-xs text-red-500">{errors.estimated_hours}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor_rate" className="text-sm font-medium">
                  Labor Rate <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="labor_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.labor_rate}
                    onChange={(e) => handleInputChange('labor_rate', Number(e.target.value))}
                    placeholder="0.00"
                    className={`pl-10 ${errors.labor_rate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.labor_rate && <p className="text-xs text-red-500">{errors.labor_rate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor_rate_type" className="text-sm font-medium">Rate Type</Label>
                <Select
                  value={formData.labor_rate_type}
                  onValueChange={(value) => handleInputChange('labor_rate_type', value as LaborRateType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {laborRateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Total Amount:</span>
                  <span className="text-lg font-bold text-slate-900">
                    ${Number(formData.total_amount).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.estimated_hours}h × ${formData.labor_rate}/h
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-sm font-medium">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', Number(e.target.value))}
                />
                <p className="text-xs text-slate-500">Order in which this job line appears</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          {isEditing ? 'Update Job Line' : 'Create Job Line'}
        </Button>
      </div>
    </div>
  );
}
