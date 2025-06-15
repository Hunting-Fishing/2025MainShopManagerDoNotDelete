import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useParts } from '@/hooks/useParts';
import { DraggablePartCard } from '../parts/DraggablePartCard';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

interface JobLineCardProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  isEditMode?: boolean;
}

export function JobLineCard({
  jobLine,
  onUpdate,
  onDelete,
  isEditMode = false
}: JobLineCardProps) {
  const { isLoading, fetchJobLineParts, removePart } = useParts();
  const [parts, setParts] = React.useState(jobLine.parts || []);
  const [showParts, setShowParts] = React.useState(false);

  React.useEffect(() => {
    const loadParts = async () => {
      if (jobLine.id) {
        const fetchedParts = await fetchJobLineParts(jobLine.id);
        setParts(fetchedParts);
      }
    };

    if (showParts) {
      loadParts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showParts, jobLine.id]);

  const handleUpdate = () => {
    // Implement update logic here
    console.log('Update job line:', jobLine.id);
    onUpdate({ ...jobLine, name: 'Updated Job Line' });
  };

  const handleDelete = () => {
    // Implement delete logic here
    console.log('Delete job line:', jobLine.id);
    onDelete(jobLine.id);
  };

  const handlePartDelete = async (partId: string) => {
    try {
      await removePart(partId);
      setParts(parts.filter(part => part.id !== partId));
    } catch (error) {
      console.error('Error deleting part:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{jobLine.name}</CardTitle>
          {isEditMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleUpdate}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the job line and remove it from the work order.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            {jobLine.description || 'No description'}
          </p>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              Est. Hours: {jobLine.estimated_hours || 0}
            </Badge>
            {jobLine.status && (
              <Badge variant="outline">
                Status: {jobLine.status}
              </Badge>
            )}
          </div>
          <div>
            {parts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold">Parts</h4>
                <div className="flex flex-wrap gap-2">
                  {parts.map((part) => (
                    <DraggablePartCard
                      key={part.id}
                      part={part}
                      isEditMode={isEditMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

