
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
    const { data, error } = await supabase
      .rpc('get_profile_metadata', { profile_id_param: profileId });
    
    if (error) {
      console.error("Error fetching profile metadata:", error);
      return null;
    }
    
    // If data is found, process it
    if (data && data.length > 0) {
      const metadata = data[0];
      // Extract the notes from the metadata JSON field if it exists
      const notes = metadata.metadata?.notes || "";
      
      return {
        ...metadata,
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
        .rpc('update_profile_metadata', { 
          profile_id_param: profileId,
          metadata_param: metadata
        });
      
      if (error) {
        console.error("Error updating profile metadata:", error);
        return false;
      }
    } else {
      // Insert new metadata
      const { error } = await supabase
        .rpc('insert_profile_metadata', {
          profile_id_param: profileId,
          metadata_param: metadata
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
