
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const initializeStorage = async () => {
  try {
    // Call the edge function to initialize storage
    const { data, error } = await supabase.functions.invoke('initialize-storage');
    
    if (error) {
      throw error;
    }
    
    console.log('Storage initialization response:', data);
    
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    toast({
      title: 'Storage Error',
      description: 'Failed to initialize image storage. Some features may not work correctly.',
      variant: 'destructive',
    });
    
    return false;
  }
};

export default initializeStorage;
