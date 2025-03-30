
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedbackForm } from '@/types/feedback';
import { getFeedbackForms, deleteFeedbackForm } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Settings, Trash, BarChart, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const FeedbackFormsList: React.FC = () => {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Temporary shop ID (in a real app, this would come from context or auth)
  const shopId = 'DEFAULT-SHOP-ID';

  useEffect(() => {
    const loadForms = async () => {
      setLoading(true);
      const formData = await getFeedbackForms(shopId);
      setForms(formData);
      setLoading(false);
    };

    loadForms();
  }, [shopId]);

  const handleCreateForm = () => {
    navigate('/feedback/forms/new');
  };

  const handleEditForm = (formId: string) => {
    navigate(`/feedback/forms/${formId}/edit`);
  };

  const handleViewResponses = (formId: string) => {
    navigate(`/feedback/forms/${formId}/responses`);
  };

  const handleViewAnalytics = (formId: string) => {
    navigate(`/feedback/forms/${formId}/analytics`);
  };

  const confirmDelete = async () => {
    if (!formToDelete) return;
    
    const success = await deleteFeedbackForm(formToDelete);
    if (success) {
      setForms(forms.filter(form => form.id !== formToDelete));
      toast({
        title: "Form Deleted",
        description: "The feedback form has been deleted successfully",
        variant: "success",
      });
    }
    setFormToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Loading feedback forms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feedback Forms</h2>
        <Button onClick={handleCreateForm}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Form
        </Button>
      </div>
      
      {forms.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-48">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600">No feedback forms created yet</p>
            <p className="text-sm text-gray-500 mt-1">Create a form to start collecting customer feedback</p>
            <Button className="mt-4" onClick={handleCreateForm}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{form.title}</CardTitle>
                  <Badge variant={form.is_active ? "success" : "secondary"}>
                    {form.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {form.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  <p>Created: {format(new Date(form.created_at), 'PPP')}</p>
                  <p>Last updated: {format(new Date(form.updated_at), 'PPP')}</p>
                  <p>Created by: {form.created_by}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditForm(form.id)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => setFormToDelete(form.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this feedback form and all associated responses. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setFormToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAnalytics(form.id)}
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewResponses(form.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Responses
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={!!formToDelete} onOpenChange={(open) => !open && setFormToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this feedback form and all associated responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
