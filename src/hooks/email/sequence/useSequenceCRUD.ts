
import { useState } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailSequence } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

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
      setSequences(data);
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
      setCurrentSequence(sequence);
      return sequence;
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
      const newSequence = await emailService.createSequence(sequence);
      if (newSequence) {
        setSequences((prev) => [newSequence, ...prev]);
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
        setSequences((prev) => 
          prev.map((s) => s.id === id ? updatedSequence : s)
        );
        if (currentSequence && currentSequence.id === id) {
          setCurrentSequence(updatedSequence);
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
