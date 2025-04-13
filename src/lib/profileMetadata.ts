
import { supabase } from '@/lib/supabase';

/**
 * Saves metadata to a user's profile_metadata record
 * @param profileId - The ID of the profile
 * @param notes - Notes to save in the metadata
 */
export async function saveProfileMetadata(profileId: string, notes: string): Promise<boolean> {
  try {
    // Check if metadata record exists
    const { data: existing, error: checkError } = await supabase
      .from('profile_metadata')
      .select('id')
      .eq('profile_id', profileId)
      .maybeSingle();
    
    if (checkError) {
      throw checkError;
    }
    
    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('profile_metadata')
        .update({
          metadata: {
            notes,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', existing.id);
        
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('profile_metadata')
        .insert({
          profile_id: profileId,
          metadata: {
            notes,
            created_at: new Date().toISOString()
          }
        });
        
      if (insertError) {
        throw insertError;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error saving profile metadata:', err);
    return false;
  }
}

/**
 * Retrieves metadata for a user's profile
 * @param profileId - The ID of the profile
 */
export async function getProfileMetadata(profileId: string): Promise<Record<string, any> | null> {
  try {
    const { data, error } = await supabase
      .from('profile_metadata')
      .select('metadata')
      .eq('profile_id', profileId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return data?.metadata || null;
  } catch (err) {
    console.error('Error retrieving profile metadata:', err);
    return null;
  }
}
