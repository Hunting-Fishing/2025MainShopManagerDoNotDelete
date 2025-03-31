
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EmailTemplateEditor } from '@/components/email/template/EmailTemplateEditor';
import { useEmailTemplates } from '@/hooks/email/useEmailTemplates';
import { EmailTemplate } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export default function EmailTemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const { 
    fetchTemplateById, 
    createTemplate, 
    updateTemplate, 
    sendTestEmail 
  } = useEmailTemplates();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchTemplateById(id)
        .then((templateData) => {
          if (templateData) {
            setTemplate(templateData);
          } else {
            toast({
              title: "Error",
              description: "Template not found",
              variant: "destructive",
            });
            navigate('/email-templates');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, fetchTemplateById, navigate, toast]);

  const handleSave = async (templateData: Partial<EmailTemplate>) => {
    try {
      if (id) {
        // Update existing template
        const updated = await updateTemplate(id, templateData);
        if (updated) {
          toast({
            title: "Success",
            description: "Template updated successfully",
          });
          return updated;
        }
      } else {
        // Create new template
        const created = await createTemplate(templateData);
        if (created) {
          toast({
            title: "Success",
            description: "Template created successfully",
          });
          navigate(`/email-template-editor/${created.id}`);
          return created;
        }
      }
      return null;
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSendTest = async (templateId: string, email: string) => {
    return await sendTestEmail(templateId, email);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Loading template...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/email-templates')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>
      
      <EmailTemplateEditor
        template={template || undefined}
        onSave={handleSave}
        onSendTest={handleSendTest}
      />
    </div>
  );
}
