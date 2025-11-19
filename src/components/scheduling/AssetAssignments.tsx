import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { useAssetAssignments } from '@/hooks/useAssetAssignments';
import { AssetAssignmentsList } from './AssetAssignmentsList';
import { AddAssetAssignmentDialog } from './AddAssetAssignmentDialog';

export function AssetAssignments() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { assignments, loading } = useAssetAssignments();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" />
              <CardTitle>Asset Assignments</CardTitle>
            </div>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : (
            <AssetAssignmentsList assignments={assignments} />
          )}
        </CardContent>
      </Card>

      <AddAssetAssignmentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
