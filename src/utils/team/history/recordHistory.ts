
import { supabase } from "@/lib/supabase";
import { RecordTeamMemberHistoryData } from "./types";

/**
 * Records an action in the team member history
 * @param data History record data
 * @returns The created history record ID
 */
export const recordTeamMemberHistory = async (
  data: RecordTeamMemberHistoryData
): Promise<string | null> => {
  try {
    const { data: record, error } = await supabase
      .from("team_member_history")
      .insert({
        profile_id: data.profile_id,
        action_type: data.action_type,
        action_by: data.action_by,
        action_by_name: data.action_by_name,
        details: data.details
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error recording team member history:", error);
      return null;
    }

    return record.id;
  } catch (error) {
    console.error("Exception recording team member history:", error);
    return null;
  }
};
