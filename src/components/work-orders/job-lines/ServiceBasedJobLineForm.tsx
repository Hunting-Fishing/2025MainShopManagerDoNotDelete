
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkOrderJobLine, LaborRateType, isValidLaborRateType } from '@/types/jobLine';

export interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel
}: ServiceBasedJobLineFormProps) {
  // Mock implementation for now - this component needs to be fully implemented
  const handleSave = () => {
    // Create mock job line with proper types
    const mockJobLine: WorkOrderJobLine = {
      id: `temp-${Date.now()}`,
      work_order_id: workOrderId,
      name: 'Sample Job Line',
      category: 'Service',
      subcategory: 'General',
      description: 'Sample job line description',
      estimated_hours: 2,
      labor_rate: 85,
      labor_rate_type: 'standard' as LaborRateType, // Properly typed
      total_amount: 170,
      status: 'pending',
      display_order: 1,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave([mockJobLine]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Add Job Line from Service</h3>
        <p className="text-gray-600">This form is under development. Click Save to add a sample job line.</p>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Job Line
        </button>
      </div>
    </div>
  );
}
