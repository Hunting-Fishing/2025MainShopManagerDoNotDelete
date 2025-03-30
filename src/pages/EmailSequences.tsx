
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmailSequences } from "@/hooks/email/useEmailSequences";
import { EmailSequenceEditor } from "@/components/email/sequence/EmailSequenceEditor";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Calendar, 
  Mail, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Play,
  PauseCircle,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  BarChart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function EmailSequences() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sequenceToEdit, setSequenceToEdit] = useState<string | null>(null);
  const [sequenceToDelete, setSequenceToDelete] = useState<string | null>(null);
  
  const { 
    sequences, 
    loading, 
    createSequence,
    updateSequence,
    deleteSequence,
    fetchSequenceById
  } = useEmailSequences();

  const handleCreateSequence = async (sequenceData: any) => {
    const result = await createSequence(sequenceData);
    if (result) {
      setIsCreateModalOpen(false);
    }
    return result;
  };

  const handleEditClick = async (sequenceId: string) => {
    setSequenceToEdit(sequenceId);
    setIsEditModalOpen(true);
  };

  const handleUpdateSequence = async (sequenceData: any) => {
    if (!sequenceToEdit) return null;
    
    const result = await updateSequence(sequenceToEdit, sequenceData);
    if (result) {
      setIsEditModalOpen(false);
      setSequenceToEdit(null);
    }
    return result;
  };

  const handleDeleteClick = (sequenceId: string) => {
    setSequenceToDelete(sequenceId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!sequenceToDelete) return;
    
    const success = await deleteSequence(sequenceToDelete);
    if (success) {
      setIsDeleteModalOpen(false);
      setSequenceToDelete(null);
    }
  };

  const getSequenceDetails = (sequenceId: string) => {
    return sequences.find((sequence) => sequence.id === sequenceId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Sequences</h1>
          <p className="text-muted-foreground">
            Create automated email sequences for customer engagement and follow-ups
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Sequence
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sequences</p>
                  <p className="text-2xl font-bold">{sequences.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Play className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sequences</p>
                  <p className="text-2xl font-bold">
                    {sequences.filter(s => s.isActive).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Sequence Length</p>
                  <p className="text-2xl font-bold">
                    {sequences.length > 0 
                      ? Math.round(sequences.reduce((sum, s) => sum + s.steps.length, 0) / sequences.length) 
                      : 0} steps
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Sequences</CardTitle>
            <CardDescription>
              Customer touchpoints currently in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p>Loading sequences...</p>
              </div>
            ) : sequences.filter(s => s.isActive).length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="bg-muted inline-flex p-3 rounded-full">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No active sequences found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Sequence
                </Button>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sequence</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequences
                      .filter(sequence => sequence.isActive)
                      .map((sequence) => (
                        <TableRow key={sequence.id}>
                          <TableCell>
                            <div className="font-medium">{sequence.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {sequence.description && sequence.description.length > 50 
                                ? `${sequence.description.substring(0, 50)}...` 
                                : sequence.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {sequence.triggerType}
                              {sequence.triggerType === 'event' && sequence.triggerEvent && 
                                `: ${sequence.triggerEvent.replace('_', ' ')}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">{sequence.steps.length}</span>
                              <span className="text-muted-foreground">emails</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(sequence.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(sequence.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Email Sequences</CardTitle>
          <CardDescription>
            Manage your automated email sequences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading sequences...</p>
            </div>
          ) : sequences.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">No sequences found</h3>
              <p className="text-muted-foreground mt-2">
                You haven't created any email sequences yet
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Sequence
              </Button>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sequences.map((sequence) => (
                    <TableRow key={sequence.id}>
                      <TableCell>
                        <div className="font-medium">{sequence.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {sequence.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {sequence.triggerType}
                          {sequence.triggerType === 'event' && sequence.triggerEvent && 
                            `: ${sequence.triggerEvent.replace('_', ' ')}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <span className="font-medium mr-1">{sequence.steps.length}</span>
                          <span className="text-muted-foreground text-sm">emails</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        {sequence.isActive ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sequence.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(sequence.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(sequence.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Sequence Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create Email Sequence</DialogTitle>
          </DialogHeader>
          <EmailSequenceEditor
            onSave={handleCreateSequence}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Sequence Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Email Sequence</DialogTitle>
          </DialogHeader>
          {sequenceToEdit && (
            <EmailSequenceEditor
              sequence={getSequenceDetails(sequenceToEdit)}
              onSave={handleUpdateSequence}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sequence</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sequence? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
