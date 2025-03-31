
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { EmailSequence, EmailSequenceAnalytics } from "@/types/email";
import { EmailSequenceFlow } from "./EmailSequenceFlow";
import { EmailSequenceAnalyticsCard } from "./EmailSequenceAnalytics";
import { EmailSequenceEditor } from "@/components/email/sequence/EmailSequenceEditor";
import { EnrollCustomerForm } from "@/components/email/sequence/EnrollCustomerForm";
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  User, 
  Play,
  Pause,
  Activity,
  Users,
  History
} from "lucide-react";

interface EmailSequenceDetailsProps {
  sequence: EmailSequence;
  analytics: EmailSequenceAnalytics | null;
  analyticsLoading?: boolean;
  onUpdate: (id: string, sequence: Partial<EmailSequence>) => Promise<EmailSequence | null>;
  onDelete: (id: string) => Promise<boolean>;
  onEnrollCustomer: (sequenceId: string, customerId: string) => Promise<boolean>;
}

export function EmailSequenceDetails({
  sequence,
  analytics,
  analyticsLoading = false,
  onUpdate,
  onDelete,
  onEnrollCustomer
}: EmailSequenceDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEnrollCustomerModalOpen, setIsEnrollCustomerModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(sequence.isActive);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdateSequence = async (updatedSequence: Partial<EmailSequence>) => {
    const result = await onUpdate(sequence.id, updatedSequence);
    if (result) {
      setIsEditModalOpen(false);
    }
    return result;
  };

  const handleDeleteSequence = async () => {
    const success = await onDelete(sequence.id);
    if (success) {
      setIsDeleteModalOpen(false);
      navigate('/email-sequences');
    }
  };

  const handleEnrollCustomer = async (customerId: string) => {
    if (!customerId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a customer ID",
        variant: "destructive",
      });
      return false;
    }
    
    setIsUpdating(true);
    try {
      const success = await onEnrollCustomer(sequence.id, customerId);
      if (success) {
        setIsEnrollCustomerModalOpen(false);
        toast({
          title: "Success",
          description: "Customer enrolled successfully",
        });
      }
      return success;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async () => {
    setIsUpdating(true);
    try {
      const result = await onUpdate(sequence.id, { 
        ...sequence, 
        isActive: !isActive 
      });
      
      if (result) {
        setIsActive(!isActive);
        toast({
          title: "Success",
          description: `Sequence ${!isActive ? 'activated' : 'deactivated'} successfully`,
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/email-sequences')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{sequence.name}</h1>
            <p className="text-muted-foreground">
              {sequence.description || "No description"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {sequence.triggerType === 'manual' && (
            <Button
              variant="outline"
              onClick={() => setIsEnrollCustomerModalOpen(true)}
              disabled={!isActive}
            >
              <User className="h-4 w-4 mr-2" />
              Enroll Customer
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="sequence-active" 
              checked={isActive}
              onCheckedChange={handleToggleActive}
              disabled={isUpdating}
            />
            <Label htmlFor="sequence-active">
              {isUpdating ? "Updating..." : isActive ? "Active" : "Inactive"}
            </Label>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flow">Flow</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sequence Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="mt-1">{sequence.name}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="mt-1">{sequence.description || "No description provided"}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Trigger Type</dt>
                    <dd className="mt-1 flex items-center">
                      {sequence.triggerType === 'manual' && (
                        <>
                          <User className="h-4 w-4 mr-1" />
                          Manual Enrollment
                        </>
                      )}
                      {sequence.triggerType === 'event' && (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Event Based
                          {sequence.triggerEvent && (
                            <span className="ml-1 text-sm text-muted-foreground">
                              ({sequence.triggerEvent})
                            </span>
                          )}
                        </>
                      )}
                      {sequence.triggerType === 'schedule' && (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Scheduled
                        </>
                      )}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Number of Steps</dt>
                    <dd className="mt-1">{sequence.steps.length}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                    <dd className="mt-1">{new Date(sequence.createdAt).toLocaleString()}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                    <dd className="mt-1">{new Date(sequence.updatedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sequence Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Enrollments</p>
                      <p className="text-2xl font-bold">{analytics?.totalEnrollments || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Activity className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Enrollments</p>
                      <p className="text-2xl font-bold">{analytics?.activeEnrollments || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <History className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{analytics?.completedEnrollments || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="flow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sequence Flow</CardTitle>
              <CardDescription>
                Visual representation of email sequence steps and conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSequenceFlow sequence={sequence} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <EmailSequenceAnalyticsCard 
            analytics={analytics} 
            loading={analyticsLoading} 
          />
        </TabsContent>
        
        <TabsContent value="enrollments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Enrollments</CardTitle>
                <CardDescription>
                  Manage customers enrolled in this sequence
                </CardDescription>
              </div>
              
              {sequence.triggerType === 'manual' && (
                <Button
                  onClick={() => setIsEnrollCustomerModalOpen(true)}
                  disabled={!isActive}
                >
                  <User className="h-4 w-4 mr-2" />
                  Enroll Customer
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {/* Enrollments will be implemented in a separate component */}
              <p className="text-center py-6 text-muted-foreground">
                Customer enrollment management will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Sequence</DialogTitle>
            <DialogDescription>
              Make changes to your email sequence.
            </DialogDescription>
          </DialogHeader>
          <EmailSequenceEditor 
            sequence={sequence} 
            onSave={handleUpdateSequence}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sequence</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sequence? This action cannot be undone
              and will cancel all active customer enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSequence}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Enroll Customer Dialog */}
      <Dialog open={isEnrollCustomerModalOpen} onOpenChange={setIsEnrollCustomerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Customer</DialogTitle>
            <DialogDescription>
              Add a customer to this email sequence.
            </DialogDescription>
          </DialogHeader>
          <EnrollCustomerForm 
            sequenceId={sequence.id}
            onEnroll={handleEnrollCustomer}
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
