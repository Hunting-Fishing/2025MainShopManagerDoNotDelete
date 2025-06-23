
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { PartsTable } from './PartsTable';
import { AddPartForm } from './AddPartForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkOrderPartsManagerProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function WorkOrderPartsManager({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode = false,
  isLoading = false,
  error = null
}: WorkOrderPartsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handlePartAdded = async () => {
    setShowAddForm(false);
    await onPartsChange();
  };

  const totalPartsValue = parts.reduce((sum, part) => sum + part.total_price, 0);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts & Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load parts: {error}
              <button 
                onClick={onPartsChange}
                className="ml-2 underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <CardTitle>Parts & Materials</CardTitle>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span className="text-sm font-normal text-muted-foreground">
            ({parts.length} items • ${totalPartsValue.toFixed(2)})
          </span>
        </div>
        
        {isEditMode && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            variant={showAddForm ? "outline" : "default"}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Part'}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showAddForm && (
          <AddPartForm
            workOrderId={workOrderId}
            jobLines={jobLines}
            onPartAdded={handlePartAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        
        <PartsTable
          parts={parts}
          jobLines={jobLines}
          onPartsChange={onPartsChange}
          isEditMode={isEditMode}
        />
      </CardContent>
    </Card>
  );
}
