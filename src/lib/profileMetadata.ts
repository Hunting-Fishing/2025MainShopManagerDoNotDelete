
import { supabase } from './supabase';

/**
 * Saves metadata for a profile
 */
export async function saveProfileMetadata(profileId: string, metadata: Record<string, any>) {
  try {
    // Check if metadata already exists
    const { data: existingData, error: fetchError } = await supabase
      .from('profile_metadata')
      .select('*')
      .eq('profile_id', profileId);

    if (fetchError) {
      console.error('Error fetching profile metadata:', fetchError);
      return false;
    }

    if (existingData && Array.isArray(existingData) && existingData.length > 0) {
      // Update existing metadata
      const { error: updateError } = await supabase
        .from('profile_metadata')
        .update({ 
          metadata: metadata,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profileId);

      if (updateError) {
        console.error('Error updating profile metadata:', updateError);
        return false;
      }
    } else {
      // Insert new metadata
      const { error: insertError } = await supabase
        .from('profile_metadata')
        .insert({
          profile_id: profileId,
          metadata: metadata
        });

      if (insertError) {
        console.error('Error inserting profile metadata:', insertError);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Error saving profile metadata:', err);
    return false;
  }
}

/**
 * Gets metadata for a profile
 */
export async function getProfileMetadata(profileId: string) {
  try {
    const { data, error } = await supabase
      .from('profile_metadata')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error getting profile metadata:', error);
      return null;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      return data[0].metadata;
    }

    return null;
  } catch (err) {
    console.error('Error getting profile metadata:', err);
    return null;
  }
}
