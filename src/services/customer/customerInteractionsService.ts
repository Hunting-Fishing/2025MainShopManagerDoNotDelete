
import { supabase } from "@/lib/supabase";
import { CustomerInteraction } from "@/types/interaction";

// Get customer interactions
export const getCustomerInteractions = async (customerId: string): Promise<CustomerInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_interactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching customer interactions:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert database records to CustomerInteraction format
    const interactions: CustomerInteraction[] = data.map(record => ({
      id: record.id,
      customerId: record.customer_id,
      customerName: record.customer_name || '',
      date: record.date,
      type: record.type,
      description: record.description,
      staffMemberId: record.staff_member_id,
      staffMemberName: record.staff_member_name,
      status: record.status,
      notes: record.notes,
      relatedWorkOrderId: record.related_work_order_id,
      followUpDate: record.follow_up_date,
      followUpCompleted: record.follow_up_completed
    }));

    return interactions;
  } catch (error) {
    console.error("Error in getCustomerInteractions:", error);
    return [];
  }
};

// Add a customer interaction
export const addCustomerInteraction = async (
  interaction: Omit<CustomerInteraction, 'id'>
): Promise<CustomerInteraction | null> => {
  try {
    // Convert to database format
    const dbInteraction = {
      customer_id: interaction.customerId,
      customer_name: interaction.customerName,
      date: interaction.date,
      type: interaction.type,
      description: interaction.description,
      staff_member_id: interaction.staffMemberId,
      staff_member_name: interaction.staffMemberName,
      status: interaction.status,
      notes: interaction.notes,
      related_work_order_id: interaction.relatedWorkOrderId,
      follow_up_date: interaction.followUpDate,
      follow_up_completed: interaction.followUpCompleted
    };

    const { data, error } = await supabase
      .from('customer_interactions')
      .insert(dbInteraction)
      .select()
      .single();

    if (error) {
      console.error("Error adding customer interaction:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Convert back to our internal format
    return {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      date: data.date,
      type: data.type,
      description: data.description,
      staffMemberId: data.staff_member_id,
      staffMemberName: data.staff_member_name,
      status: data.status,
      notes: data.notes,
      relatedWorkOrderId: data.related_work_order_id,
      followUpDate: data.follow_up_date,
      followUpCompleted: data.follow_up_completed
    };
  } catch (error) {
    console.error("Error in addCustomerInteraction:", error);
    return null;
  }
};

// Update a customer interaction
export const updateCustomerInteraction = async (
  id: string,
  updates: Partial<CustomerInteraction>
): Promise<CustomerInteraction | null> => {
  try {
    // Convert to database format
    const dbUpdates: any = {};
    
    if (updates.customerName) dbUpdates.customer_name = updates.customerName;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.staffMemberId) dbUpdates.staff_member_id = updates.staffMemberId;
    if (updates.staffMemberName) dbUpdates.staff_member_name = updates.staffMemberName;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.notes) dbUpdates.notes = updates.notes;
    if (updates.relatedWorkOrderId) dbUpdates.related_work_order_id = updates.relatedWorkOrderId;
    if (updates.followUpDate) dbUpdates.follow_up_date = updates.followUpDate;
    if (updates.followUpCompleted !== undefined) dbUpdates.follow_up_completed = updates.followUpCompleted;

    const { data, error } = await supabase
      .from('customer_interactions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer interaction:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Convert back to our internal format
    return {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      date: data.date,
      type: data.type,
      description: data.description,
      staffMemberId: data.staff_member_id,
      staffMemberName: data.staff_member_name,
      status: data.status,
      notes: data.notes,
      relatedWorkOrderId: data.related_work_order_id,
      followUpDate: data.follow_up_date,
      followUpCompleted: data.follow_up_completed
    };
  } catch (error) {
    console.error("Error in updateCustomerInteraction:", error);
    return null;
  }
};

// Delete a customer interaction
export const deleteCustomerInteraction = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customer_interactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting customer interaction:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCustomerInteraction:", error);
    return false;
  }
};
