
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useEmailSequences } from '@/hooks/email/useEmailSequences';
import { EmailSequenceSteps } from './EmailSequenceSteps';
import { EmailSequenceAnalytics } from './EmailSequenceAnalytics';
import { EmailSequenceEnrollments } from './EmailSequenceEnrollments';
import { EmailSequenceProcessButton } from './EmailSequenceProcessButton';
import { 
  ArrowLeft, 
  PenLine, 
  Trash2, 
  Play, 
  Pause, 
  BarChart, 
  ListChecks, 
  Users 
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function EmailSequenceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('steps');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { 
    currentSequence, 
    updateSequence,
    deleteSequence
  } = useEmailSequences();
  
  if (!currentSequence || !id) {
    return <div>Loading...</div>;
  }
  
  const handleToggleActive = async () => {
    try {
      await updateSequence(id, { 
        isActive: !currentSequence.isActive 
      });
      
      toast({
        title: `Sequence ${currentSequence.isActive ? 'deactivated' : 'activated'}`,
        description: `The sequence has been ${currentSequence.isActive ? 'deactivated' : 'activated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling sequence activation:', error);
      toast({
        title: 'Error',
        description: 'Could not update sequence status',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteSequence = async () => {
    try {
      await deleteSequence(id);
      toast({
        title: 'Sequence deleted',
        description: 'The sequence has been deleted successfully'
      });
      navigate('/email-sequences');
    } catch (error) {
      console.error('Error deleting sequence:', error);
      toast({
        title: 'Error',
        description: 'Could not delete sequence',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/email-sequences')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{currentSequence.name}</h1>
          <Badge variant={currentSequence.isActive ? "success" : "secondary"}>
            {currentSequence.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <EmailSequenceProcessButton className="mr-2" />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleActive}
          >
            {currentSequence.isActive ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/email-sequence-edit/${id}`)}
          >
            <PenLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sequence Details</CardTitle>
          <CardDescription>{currentSequence.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Trigger Type</p>
              <p className="text-sm text-muted-foreground">
                {currentSequence.triggerType === 'manual' 
                  ? 'Manual Enrollment' 
                  : currentSequence.triggerType === 'event' 
                    ? 'Event Based' 
                    : 'Scheduled'}
              </p>
            </div>
            
            {currentSequence.triggerType === 'event' && (
              <div>
                <p className="text-sm font-medium">Trigger Event</p>
                <p className="text-sm text-muted-foreground">
                  {currentSequence.triggerEvent || 'None'}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium">Steps</p>
              <p className="text-sm text-muted-foreground">
                {currentSequence.steps.length} {currentSequence.steps.length === 1 ? 'step' : 'steps'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="steps">
            <ListChecks className="h-4 w-4 mr-2" />
            Steps
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="h-4 w-4 mr-2" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="steps">
          <EmailSequenceSteps sequenceId={id} steps={currentSequence.steps} />
        </TabsContent>
        
        <TabsContent value="enrollments">
          <EmailSequenceEnrollments sequenceId={id} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <EmailSequenceAnalytics sequenceId={id} />
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sequence
              and all associated steps and enrollments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSequence} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
