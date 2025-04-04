
import { supabase } from "@/lib/supabase";

export interface ProfileMetadata {
  id?: string;
  profile_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export async function getProfileMetadata(profileId: string): Promise<ProfileMetadata | null> {
  try {
    // Using select instead of rpc since the function doesn't exist
    const { data, error } = await supabase
      .from('profile_metadata')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    
    if (error) {
      console.error("Error fetching profile metadata:", error);
      return null;
    }
    
    // If data is found, process it
    if (data) {
      // Extract the notes from the metadata JSON field if it exists
      const notes = data.metadata?.notes || "";
      
      return {
        ...data,
        notes
      };
    }
    
    return null;
  } catch (error) {
    console.error("Exception in getProfileMetadata:", error);
    return null;
  }
}

export async function updateProfileMetadata(
  profileId: string, 
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    // Check if metadata exists for this profile
    const existing = await getProfileMetadata(profileId);
    
    if (existing) {
      // Update existing metadata
      const { error } = await supabase
        .from('profile_metadata')
        .update({ 
          metadata: metadata,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', profileId);
      
      if (error) {
        console.error("Error updating profile metadata:", error);
        return false;
      }
    } else {
      // Insert new metadata
      const { error } = await supabase
        .from('profile_metadata')
        .insert({
          profile_id: profileId,
          metadata: metadata
        });
      
      if (error) {
        console.error("Error creating profile metadata:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Exception in updateProfileMetadata:", error);
    return false;
  }
}

// Add the saveProfileMetadata function that's being referenced elsewhere
export async function saveProfileMetadata(
  profileId: string,
  notes: string
): Promise<boolean> {
  try {
    // We need to store notes inside the metadata object
    const metadata = {
      notes: notes
    };
    
    return await updateProfileMetadata(profileId, metadata);
  } catch (error) {
    console.error("Error saving profile metadata:", error);
    return false;
  }
}
