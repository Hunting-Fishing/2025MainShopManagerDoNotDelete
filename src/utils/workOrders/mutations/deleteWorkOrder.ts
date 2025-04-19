
import { supabase } from "@/integrations/supabase/client";

export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting work order:", error);
      throw new Error(error.message);
    }

    return true;
  } catch (err) {
    console.error("Error in deleteWorkOrder:", err);
    throw err;
  }
};
