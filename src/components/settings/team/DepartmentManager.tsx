
import { useState } from 'react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useDepartments, Department } from '@/hooks/team/useDepartments';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DepartmentManager() {
  const { departments, isLoading, addDepartment } = useDepartments();
  const [newDepartment, setNewDepartment] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateDepartment = async () => {
    if (newDepartment.trim()) {
      await addDepartment(newDepartment.trim(), newDescription.trim() || undefined);
      setNewDepartment('');
      setNewDescription('');
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Departments</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new department to organize team members.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Department Name</label>
                <Input
                  id="name"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                <Input
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter department description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDepartment}>Create Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {departments.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 font-medium text-sm text-muted-foreground">
              <div>Name</div>
              <div>Description</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="border-t" />
            {departments.map((dept) => (
              <DepartmentRow key={dept.id} department={dept} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 text-muted-foreground">
            No departments have been added yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DepartmentRow({ department }: { department: Department }) {
  return (
    <div className="grid grid-cols-3 items-center py-3">
      <div className="font-medium">{department.name}</div>
      <div className="text-sm text-muted-foreground">
        {department.description || "—"}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
