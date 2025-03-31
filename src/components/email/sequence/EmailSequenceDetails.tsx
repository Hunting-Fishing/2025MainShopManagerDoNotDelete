
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { 
  ArrowLeft, Edit, Play, AlertCircle, Users, CheckCircle, 
  Clock, BarChart3, LayoutList 
} from 'lucide-react';
import { useEmailSequences } from '@/hooks/email/useEmailSequences';
import { EmailSequence, EmailSequenceEnrollment } from '@/types/email';
import { EmailSequenceFlow } from './EmailSequenceFlow';
import { EmailSequenceAnalytics } from './EmailSequenceAnalytics';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { EnrollCustomerForm } from './EnrollCustomerForm';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';

type SequenceParams = {
  id: string;
}

const EmailSequenceDetails = () => {
  const { id } = useParams<SequenceParams>();
  const navigate = useNavigate();
  const { 
    currentSequence, 
    sequenceLoading, 
    fetchSequenceById,
    enrollments,
    enrollmentsLoading,
    fetchCustomerEnrollments
  } = useEmailSequences();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSequenceById(id);
      fetchCustomerEnrollments(id);
    }
  }, [id, fetchSequenceById, fetchCustomerEnrollments]);

  if (sequenceLoading || !currentSequence) {
    return <div>Loading sequence details...</div>;
  }

  const handleBackClick = () => {
    navigate('/email-sequences');
  };

  const handleEditClick = () => {
    navigate(`/email-sequences/${currentSequence.id}/edit`);
  };

  const handleEnrollCustomer = () => {
    setIsEnrollModalOpen(true);
  };

  const getStatusBadge = (status: EmailSequenceEnrollment['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Active</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const CreatedAt = ({ sequence }: { sequence: EmailSequence }) => (
    <div className="text-sm text-muted-foreground">
      <span className="font-medium">Created:</span>{' '}
      {format(new Date(sequence.created_at), 'MMM d, yyyy')}
    </div>
  );

  const UpdatedAt = ({ sequence }: { sequence: EmailSequence }) => (
    <div className="text-sm text-muted-foreground">
      <span className="font-medium">Last updated:</span>{' '}
      {format(new Date(sequence.updated_at), 'MMM d, yyyy')}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentSequence.name}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Sequence
            </Button>
            <Button variant="secondary" size="sm" onClick={handleEnrollCustomer}>
              <Play className="mr-2 h-4 w-4" />
              Enroll Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{currentSequence.description}</CardDescription>
          <Separator className="my-4" />
          <div className="flex items-center space-x-4">
            <CreatedAt sequence={currentSequence} />
            <UpdatedAt sequence={currentSequence} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList>
          <TabsTrigger value="flow">
            <LayoutList className="mr-2 h-4 w-4" />
            Flow
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="mr-2 h-4 w-4" />
            Enrollments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sequence Flow</CardTitle>
              <CardDescription>Visualize the sequence of emails and delays.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSequenceFlow sequence={currentSequence} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <EmailSequenceAnalytics sequenceId={currentSequence.id} />
        </TabsContent>
        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Enrollments</CardTitle>
              <CardDescription>
                Manage and view customers enrolled in this sequence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <div className="text-center py-8">
                  <p>Loading enrollments...</p>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="inline-block h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No customers enrolled in this sequence.</p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrolled At</TableHead>
                        <TableHead>Completed At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>{enrollment.customerId}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell>
                            {format(new Date(enrollment.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {enrollment.completed_at ? format(new Date(enrollment.completed_at), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enroll Customer Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Customer</DialogTitle>
            <DialogDescription>
              Enroll a customer in the "{currentSequence.name}" email sequence.
            </DialogDescription>
          </DialogHeader>
          <EnrollCustomerForm sequenceId={currentSequence.id} onClose={() => setIsEnrollModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSequenceDetails;
