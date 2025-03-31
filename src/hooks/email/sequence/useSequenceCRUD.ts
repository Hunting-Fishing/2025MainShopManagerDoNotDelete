import { useState } from "react";
import { emailService } from '@/services/email';
import { EmailSequence, EmailSequenceStep } from '@/types/email';
import { useToast } from '@/hooks/use-toast';

export const useSequenceCRUD = () => {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [currentSequence, setCurrentSequence] = useState<EmailSequence | null>(null);
  const [loading, setLoading] = useState(false);
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const { toast } = useToast();

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const data = await emailService.getSequences();
      if (Array.isArray(data)) {
        const formattedSequences: EmailSequence[] = data.map(seq => ({
          ...seq,
          steps: seq.steps || [],
          trigger_type: seq.triggerType || seq.trigger_type || 'manual',
          trigger_event: seq.triggerEvent || seq.trigger_event || '',
          is_active: seq.isActive || seq.is_active || false
        }));
        
        setSequences(formattedSequences);
      } else {
        console.error("Expected an array of sequences");
        setSequences([]);
      }
    } catch (error) {
      console.error("Error fetching email sequences:", error);
      toast({
        title: "Error",
        description: "Failed to load email sequences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSequenceById = async (id: string) => {
    setSequenceLoading(true);
    try {
      const sequence = await emailService.getSequenceById(id);
      if (sequence) {
        const formattedSequence: EmailSequence = {
          ...sequence,
          steps: sequence.steps || [],
          trigger_type: sequence.triggerType || sequence.trigger_type || 'manual',
          trigger_event: sequence.triggerEvent || sequence.trigger_event || '',
          is_active: sequence.isActive || sequence.is_active || false
        };
        
        setCurrentSequence(formattedSequence);
        return formattedSequence;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to load email sequence",
        variant: "destructive",
      });
      return null;
    } finally {
      setSequenceLoading(false);
    }
  };

  const createSequence = async (sequence: Partial<EmailSequence>) => {
    try {
      const tempSequence = {
        id: Date.now().toString(),
        ...sequence,
        steps: sequence.steps || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        trigger_type: sequence.triggerType || sequence.trigger_type || 'manual',
        trigger_event: sequence.triggerEvent || sequence.trigger_event || '',
        is_active: sequence.isActive || sequence.is_active || false
      } as EmailSequence;
      
      const newSequence = await emailService.createSequence(tempSequence);
      if (newSequence) {
        const formattedSequence: EmailSequence = {
          ...newSequence,
          steps: newSequence.steps || [],
          trigger_type: newSequence.triggerType || newSequence.trigger_type || 'manual',
          trigger_event: newSequence.triggerEvent || newSequence.trigger_event || '',
          is_active: newSequence.isActive || newSequence.is_active || false
        };
        
        setSequences((prev) => [formattedSequence, ...prev]);
        toast({
          title: "Success",
          description: "Email sequence created successfully",
        });
      }
      return newSequence;
    } catch (error) {
      console.error("Error creating email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to create email sequence",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSequence = async (id: string, sequence: Partial<EmailSequence>) => {
    try {
      const updatedSequence = await emailService.updateSequence(id, sequence);
      if (updatedSequence) {
        const formattedSequence: EmailSequence = {
          ...updatedSequence,
          steps: updatedSequence.steps || [],
          trigger_type: updatedSequence.triggerType || updatedSequence.trigger_type || 'manual',
          trigger_event: updatedSequence.triggerEvent || updatedSequence.trigger_event || '',
          is_active: updatedSequence.isActive || updatedSequence.is_active || false
        };
        
        setSequences((prev) => 
          prev.map((s) => s.id === id ? formattedSequence : s)
        );
        if (currentSequence && currentSequence.id === id) {
          setCurrentSequence(formattedSequence);
        }
        toast({
          title: "Success",
          description: "Email sequence updated successfully",
        });
      }
      return updatedSequence;
    } catch (error) {
      console.error("Error updating email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to update email sequence",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      await emailService.deleteSequence(id);
      setSequences((prev) => prev.filter((s) => s.id !== id));
      if (currentSequence && currentSequence.id === id) {
        setCurrentSequence(null);
      }
      toast({
        title: "Success",
        description: "Email sequence deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to delete email sequence",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    sequences,
    currentSequence,
    loading,
    sequenceLoading,
    fetchSequences,
    fetchSequenceById,
    createSequence,
    updateSequence,
    deleteSequence,
    setCurrentSequence
  };
};
