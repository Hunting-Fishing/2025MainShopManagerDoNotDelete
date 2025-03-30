
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmailSequences } from "@/hooks/email/useEmailSequences";
import { EmailSequenceEditor } from "@/components/email/sequence/EmailSequenceEditor";
import { EmailSequence } from "@/types/email";
import { format } from "date-fns";
import { 
  Plus,
  CalendarClock,
  AlertTriangle,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  User
} from "lucide-react";

export default function EmailSequences() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEnrollCustomerModalOpen, setIsEnrollCustomerModalOpen] = useState(false);
  const [sequenceToEdit, setSequenceToEdit] = useState<EmailSequence | null>(null);
  const [sequenceToDelete, setSequenceToDelete] = useState<string | null>(null);
  const [sequenceToEnroll, setSequenceToEnroll] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const navigate = useNavigate();
  
  const { 
    sequences, 
    loading, 
    fetchSequenceById,
    createSequence, 
    updateSequence,
    deleteSequence,
    enrollCustomer
  } = useEmailSequences();

  const filteredSequences = sequences.filter(sequence => {
    // Apply active filter
    if (activeFilter === "active" && !sequence.isActive) return false;
    if (activeFilter === "inactive" && sequence.isActive) return false;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        sequence.name.toLowerCase().includes(query) || 
        (sequence.description && sequence.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const handleCreateSequence = async (sequence: Partial<EmailSequence>) => {
    const result = await createSequence(sequence);
    if (result) {
      setIsCreateModalOpen(false);
    }
    return result;
  };

  const handleEditClick = async (sequenceId: string) => {
    const sequence = await fetchSequenceById(sequenceId);
    if (sequence) {
      setSequenceToEdit(sequence);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateSequence = async (sequence: Partial<EmailSequence>) => {
    if (!sequenceToEdit) return null;
    
    const result = await updateSequence(sequenceToEdit.id, sequence);
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

  const handleEnrollClick = (sequenceId: string) => {
    setSequenceToEnroll(sequenceId);
    setIsEnrollCustomerModalOpen(true);
  };

  const handleEnrollCustomer = async () => {
    if (!sequenceToEnroll || !customerId) return;
    
    setEnrollLoading(true);
    try {
      const success = await enrollCustomer(sequenceToEnroll, customerId);
      if (success) {
        setIsEnrollCustomerModalOpen(false);
        setSequenceToEnroll(null);
        setCustomerId("");
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'manual':
        return 'Manual Enrollment';
      case 'event':
        return 'Event Based';
      case 'schedule':
        return 'Scheduled';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Sequences</h1>
          <p className="text-muted-foreground">
            Create automated email sequences for customer engagement
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
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Steps</p>
                  <p className="text-2xl font-bold">
                    {sequences.length === 0 ? "0" : 
                      Math.round(
                        sequences.reduce((sum, seq) => sum + seq.steps.length, 0) / 
                        sequences.length
                      )
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common actions for email sequence management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-10 w-10 mb-1" />
                <span className="text-sm font-medium">Create Sequence</span>
                <span className="text-xs text-muted-foreground text-center">Start a new automated email series</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                onClick={() => navigate('/email-templates')}
              >
                <Mail className="h-10 w-10 mb-1" />
                <span className="text-sm font-medium">Manage Templates</span>
                <span className="text-xs text-muted-foreground text-center">Create and edit email templates</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-4 gap-2"
                onClick={() => navigate('/email-campaigns')}
              >
                <ArrowUpRight className="h-10 w-10 mb-1" />
                <span className="text-sm font-medium">Email Campaigns</span>
                <span className="text-xs text-muted-foreground text-center">Manage one-time email campaigns</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Email Sequences</CardTitle>
              <CardDescription>
                Manage your automated email sequences
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <Input
                  placeholder="Search sequences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60"
                />
              </div>
              <Tabs 
                value={activeFilter} 
                onValueChange={(value) => setActiveFilter(value as "all" | "active" | "inactive")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-3 h-9">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                  <TabsTrigger value="inactive" className="text-xs">Inactive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading sequences...</p>
            </div>
          ) : filteredSequences.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">No sequences found</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                {searchQuery
                  ? `No sequences matching "${searchQuery}"`
                  : activeFilter !== "all"
                  ? `No ${activeFilter} sequences found`
                  : "You haven't created any email sequences yet"}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Sequence
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell>
                      <div className="font-medium">{sequence.name}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {sequence.description || "No description"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {format(new Date(sequence.createdAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {sequence.steps.length}
                        </Badge>
                        <div className="text-sm">
                          {sequence.steps.length === 0 
                            ? "No steps defined" 
                            : sequence.steps.length === 1 
                              ? "1 step" 
                              : `${sequence.steps.length} steps`}
                        </div>
                      </div>
                      {sequence.steps.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Delay: {sequence.steps.reduce((total, step) => total + step.delayHours, 0)} hours total
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {sequence.triggerType === 'manual' && (
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                        )}
                        {sequence.triggerType === 'event' && (
                          <AlertCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                        )}
                        {sequence.triggerType === 'schedule' && (
                          <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
                        )}
                        <span>{getTriggerTypeLabel(sequence.triggerType)}</span>
                      </div>
                      {sequence.triggerType === 'event' && sequence.triggerEvent && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Event: {sequence.triggerEvent.replace('_', ' ')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge 
                          variant={sequence.isActive ? "default" : "secondary"} 
                          className="w-16 justify-center"
                        >
                          {sequence.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {sequence.triggerType === 'manual' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEnrollClick(sequence.id)}
                            disabled={!sequence.isActive}
                            title={!sequence.isActive ? "Sequence must be active to enroll customers" : ""}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Enroll
                          </Button>
                        )}
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
          )}
        </CardContent>
      </Card>
      
      {/* Create Sequence Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Create Email Sequence</DialogTitle>
            <DialogDescription>
              Create a multi-step email sequence that sends automatically
            </DialogDescription>
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
            <DialogDescription>
              Modify your email sequence settings and steps
            </DialogDescription>
          </DialogHeader>
          {sequenceToEdit && (
            <EmailSequenceEditor
              sequence={sequenceToEdit}
              onSave={handleUpdateSequence}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sequence</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email sequence?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will permanently delete the sequence and cancel any active enrollments.
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Enroll Customer Modal */}
      <Dialog open={isEnrollCustomerModalOpen} onOpenChange={setIsEnrollCustomerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Customer</DialogTitle>
            <DialogDescription>
              Add a customer to this email sequence
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-id">Customer ID</Label>
              <Input
                id="customer-id"
                placeholder="Enter customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEnrollCustomerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnrollCustomer}
                disabled={enrollLoading || !customerId}
              >
                {enrollLoading ? "Enrolling..." : "Enroll Customer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
